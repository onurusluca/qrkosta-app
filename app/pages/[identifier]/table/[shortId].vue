<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Shop = Database['public']['Tables']['shops']['Row']
type TableRow = Database['public']['Tables']['tables']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

const route = useRoute()
const { t, locale } = useI18n()
const identifier = computed(() => route.params.identifier as string)
const tableShortId = computed(() => route.params.shortId as string)

function isShortId(id: string) {
  return /^[A-Za-z0-9]{5}$/.test(id)
}

function localeText(val: import('~/types/database.types').Json | null | undefined): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  const o = val as Record<string, string>
  return o[locale.value] ?? o.en ?? o.ja ?? Object.values(o)[0] ?? ''
}

const { data: payload, error, pending } = await useAsyncData(
  `table-${identifier.value}-${tableShortId.value}`,
  () => $fetch<{ shop: Shop, table: TableRow, sessionId: string, categories: MenuCategory[], items: MenuItem[], variants: MenuItemVariant[] }>(`/api/shop/${identifier.value}/table/${tableShortId.value}`),
  { watch: [identifier, tableShortId], server: true }
)

// Redirect short_id to slug with UTM (same as shop page)
const redirectToSlug = computed(() => isShortId(identifier.value) && payload.value?.shop?.slug && identifier.value !== payload.value.shop.slug)
if (redirectToSlug.value && payload.value?.shop?.slug) {
  await navigateTo(`/${payload.value.shop.slug}/table/${tableShortId.value}?utm_source=qr-code`, { replace: true })
}
watch(redirectToSlug, (v) => {
  if (v && payload.value?.shop?.slug) {
    navigateTo(`/${payload.value.shop.slug}/table/${tableShortId.value}?utm_source=qr-code`, { replace: true })
  }
}, { immediate: true })

const shop = computed(() => payload.value?.shop ?? null)
const table = computed(() => payload.value?.table ?? null)
const sessionId = computed(() => payload.value?.sessionId ?? '')
const categories = computed(() => payload.value?.categories ?? [])
const items = computed(() => payload.value?.items ?? [])
const variants = computed(() => payload.value?.variants ?? [])

type CartLine = { menuItemId: string, variantId?: string, quantity: number, price: number }
const cart = ref<CartLine[]>([])
const isSubmitting = ref(false)
const toast = useToast()
const drawerOpen = ref(false)

function addToCart(payload: { menuItemId: string, variantId?: string, quantity: number, price: number }) {
  const existing = cart.value.find(
    l => l.menuItemId === payload.menuItemId && l.variantId === payload.variantId
  )
  if (existing) {
    existing.quantity += payload.quantity
  } else {
    cart.value.push({
      menuItemId: payload.menuItemId,
      variantId: payload.variantId,
      quantity: payload.quantity,
      price: payload.price
    })
  }
}

function removeFromCart(payload: { menuItemId: string, variantId?: string }) {
  const line = cart.value.find(l => l.menuItemId === payload.menuItemId && l.variantId === payload.variantId)
  if (!line) return
  line.quantity -= 1
  if (line.quantity <= 0) {
    cart.value = cart.value.filter(l => !(l.menuItemId === payload.menuItemId && l.variantId === payload.variantId))
  }
}

const cartTotal = computed(() => cart.value.reduce((sum, l) => sum + l.price * l.quantity, 0))
const cartCount = computed(() => cart.value.reduce((sum, l) => sum + l.quantity, 0))

async function placeOrder() {
  if (!sessionId.value || !shop.value || !table.value || cart.value.length === 0) return
  isSubmitting.value = true
  try {
    await $fetch('/api/order', {
      method: 'POST',
      body: {
        session_id: sessionId.value,
        table_id: table.value.id,
        shop_id: shop.value.id,
        items: cart.value.map(l => ({
          menu_item_id: l.menuItemId,
          quantity: l.quantity
        }))
      }
    })
    cart.value = []
    drawerOpen.value = false
    toast.add({ title: t('shop.orderSent'), color: 'success' })
  } catch {
    toast.add({ title: t('shop.orderError'), color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: () => (shop.value ? `${localeText(shop.value.name as import('~/types/database.types').Json)} · ${t('shop.table', { number: table.value?.table_number ?? '' })}` : t('shop.title'))
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 pb-24">
    <div
      v-if="pending && !shop"
      class="flex min-h-screen items-center justify-center"
    >
      <UIcon
        name="lucide:loader-2"
        class="size-8 animate-spin text-neutral-400"
      />
    </div>

    <div
      v-else-if="error"
      class="flex min-h-screen flex-col items-center justify-center gap-4 px-4"
    >
      <UIcon
        name="lucide:store-off"
        class="size-16 text-neutral-300"
      />
      <p class="text-center text-neutral-600">
        {{ (error as { statusMessage?: string })?.statusMessage === 'Table not found' ? t('shop.notFound') : t('shop.error') }}
      </p>
    </div>

    <template v-else-if="shop && table">
      <header class="border-b border-neutral-200 bg-white px-4 py-6">
        <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <NuxtImg
            v-if="shop.logo_url"
            :src="shop.logo_url"
            alt=""
            class="size-20 shrink-0 rounded-2xl object-cover shadow-sm"
            width="80"
            height="80"
            provider="bunny"
          />
          <div class="min-w-0 flex-1">
            <h1 class="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              {{ localeText(shop.name) }}
            </h1>
            <p class="mt-1 text-sm font-medium text-neutral-600">
              {{ t('shop.table', { number: table.table_number }) }}
            </p>
            <p
              v-if="shop.address && typeof shop.address === 'object' && 'formatted' in shop.address"
              class="mt-0.5 text-sm text-neutral-500"
            >
              {{ (shop.address as { formatted?: string }).formatted }}
            </p>
            <a
              v-if="shop.google_maps_url"
              :href="shop.google_maps_url"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              <UIcon
                name="lucide:map-pin"
                class="size-4"
              />
              {{ t('shop.map') }}
            </a>
          </div>
        </div>
      </header>

      <Menu
        :categories="categories"
        :items="items"
        :variants="variants"
        :orderable="true"
        :cart="cart"
        @add="addToCart"
        @remove="removeFromCart"
      />
    </template>

    <!-- Bottom bar = drawer trigger: fixed when cart has items; click opens drawer -->
    <div
      v-if="shop && table && cartCount > 0"
      class="fixed bottom-0 left-0 right-0 z-20 border-t  rounded-t-xl border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
    >
      <UDrawer
        v-model:open="drawerOpen"
        direction="bottom"
        :ui="{ container: 'max-w-2xl mx-auto' }"
      >
        <UButton
          color="primary"
          variant="solid"
          class="w-full justify-between rounded-t-lg! rounded-b-none! px-4 py-4"
          trailing-icon="lucide:chevron-up"
        >
          <span class="font-semibold text-white">
            {{ new Intl.NumberFormat(undefined, { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(cartTotal) }}
            <span class="ml-1 text-md font-normal text-white/90">· {{ t('shop.cartItems', { count: cartCount }) }}</span>
          </span>
          <span class="text-md font-medium text-white">{{ t('shop.confirmOrder') }}</span>
        </UButton>
        <template #content>
          <div class="flex flex-col gap-4 p-4">
            <h2 class="text-lg font-semibold text-neutral-900">
              {{ t('shop.confirmOrder') }}
            </h2>
            <ul class="max-h-48 space-y-2 overflow-y-auto">
              <li
                v-for="(line, i) in cart"
                :key="i"
                class="flex justify-between gap-2 text-sm"
              >
                <span class="text-neutral-700">× {{ line.quantity }}</span>
                <span class="font-medium text-neutral-900">{{ new Intl.NumberFormat(undefined, { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(line.price * line.quantity) }}</span>
              </li>
            </ul>
            <p class="flex justify-between border-t border-neutral-200 pt-3 font-semibold text-neutral-900">
              <span>{{ t('shop.placeOrder') }}</span>
              <span>{{ new Intl.NumberFormat(undefined, { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(cartTotal) }}</span>
            </p>
            <UButton
              :loading="isSubmitting"
              :disabled="isSubmitting"
              size="lg"
              class="w-full justify-center"
              @click="placeOrder"
            >
              {{ t('shop.placeOrder') }}
            </UButton>
          </div>
        </template>
      </UDrawer>
    </div>
  </div>
</template>
