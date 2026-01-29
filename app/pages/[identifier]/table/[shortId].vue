<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Shop = Database['public']['Tables']['shops']['Row']
type TableRow = Database['public']['Tables']['tables']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

interface OrderItemWithName {
  id: string
  quantity: number
  menu_item_id: string | null
  menu_items: { name: import('~/types/database.types').Json } | null
}
interface OrderWithItems {
  id: string
  session_id: string
  created_at: string | null
  total_amount: number | null
  status: string | null
  order_items: OrderItemWithName[]
}

const route = useRoute()
const { t, locale } = useI18n()
const { formatPrice, currency } = useCurrency()
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

function orderItemName(item: OrderItemWithName): string {
  return localeText(item.menu_items?.name ?? null) || t('shop.noMenu')
}

function formatOrderDate(createdAt: string | null): string {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  return d.toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' })
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

const drawerView = ref<'cart' | 'past-orders'>('cart')
const pastOrdersUrl = computed(() => `/api/shop/${identifier.value}/table/${tableShortId.value}/orders`)
const { data: pastOrdersPayload, execute: fetchPastOrders } = await useAsyncData(
  'past-orders',
  () => $fetch<{ orders: OrderWithItems[] }>(pastOrdersUrl.value),
  { immediate: true, server: false }
)
const pastOrders = computed(() => pastOrdersPayload.value?.orders ?? [])
const pastOrdersSessionIds = computed(() => [...new Set(pastOrders.value.map(o => o.session_id))])
const hasMultipleSessions = computed(() => pastOrdersSessionIds.value.length > 1)
const myPastOrders = computed(() => pastOrders.value.filter(o => o.session_id === sessionId.value))
const allPastOrders = computed(() => pastOrders.value)
const showDrawerTrigger = computed(() => cartCount.value > 0 || myPastOrders.value.length > 0)

async function openPastOrders() {
  drawerView.value = 'past-orders'
  await fetchPastOrders()
}

function closePastOrders() {
  drawerView.value = 'cart'
}

function onDrawerOpenChange(open: boolean) {
  if (!open) drawerView.value = 'cart'
}

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
    await fetchPastOrders()
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
        name="lucide:store"
        class="size-16 text-neutral-300"
      />
      <p class="text-center text-neutral-600">
        {{ (error as { statusMessage?: string })?.statusMessage === 'Table not found' ? t('shop.notFound') : t('shop.error') }}
      </p>
    </div>

    <template v-else-if="shop && table">
      <header class="border-b border-neutral-200 bg-white px-4 py-6">
        <div class="flex justify-end gap-2 px-4 pb-2">
          <LanguageChanger />
          <CurrencyChanger />
        </div>
        <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <div
            v-if="shop.logo_url"
            class="flex max-h-20 max-w-32 shrink-0 items-center justify-center"
          >
            <NuxtImg
              :src="shop.logo_url"
              alt=""
              class="max-h-full max-w-full object-contain"
              loading="lazy"
              provider="bunny"
            />
          </div>
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

    <!-- Bottom bar = drawer toggle: only when user has cart items or has ordered before -->
    <div
      v-if="shop && table && showDrawerTrigger"
      class="fixed bottom-0 left-0 right-0 z-20 border-t rounded-t-xl border-neutral-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
    >
      <UDrawer
        v-model:open="drawerOpen"
        direction="bottom"
        :ui="{ container: 'max-w-2xl mx-auto' }"
        @update:open="onDrawerOpenChange"
      >
        <UButton
          color="primary"
          variant="solid"
          class="w-full justify-between rounded-t-lg! rounded-b-none! px-4 py-4"
          trailing-icon="lucide:chevron-up"
        >
          <span class="font-semibold text-white">
            <template v-if="cartCount > 0">
              {{ formatPrice(cartTotal) }}
              <span class="ml-1 text-md font-normal text-white/90">· {{ t('shop.cartItems', { count: cartCount }) }}</span>
            </template>
            <template v-else>
              {{ t('shop.cartItems', { count: 0 }) }}
            </template>
          </span>
          <span class="text-md font-medium text-white">{{ t('shop.confirmOrder') }}</span>
        </UButton>
        <template #content>
          <!-- Cart view (default) -->
          <div
            v-if="drawerView === 'cart'"
            class="flex flex-col gap-4 p-4"
          >
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-lg font-semibold text-neutral-900">
                {{ t('shop.confirmOrder') }}
              </h2>
              <UButton
                variant="ghost"
                color="neutral"
                icon="lucide:history"
                :label="t('shop.pastOrders')"
                @click="openPastOrders"
              />
            </div>
            <template v-if="cart.length > 0">
              <ul class="max-h-48 space-y-2 overflow-y-auto">
                <li
                  v-for="(line, i) in cart"
                  :key="i"
                  class="flex justify-between gap-2 text-sm"
                >
                  <span class="text-neutral-700">× {{ line.quantity }}</span>
                  <span class="font-medium text-neutral-900">{{ formatPrice(line.price * line.quantity) }}</span>
                </li>
              </ul>
              <p class="flex justify-between border-t border-neutral-200 pt-3 font-semibold text-neutral-900">
                <span>{{ t('shop.placeOrder') }}</span>
                <span>
                  {{ formatPrice(cartTotal) }}
                  <span
                    v-if="currency !== 'JPY'"
                    class="ml-1.5 text-sm font-normal text-neutral-500"
                  >(¥{{ cartTotal.toLocaleString() }})</span>
                </span>
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
            </template>
            <p
              v-else
              class="text-sm text-neutral-500"
            >
              {{ t('shop.cartItems', { count: 0 }) }}
            </p>
          </div>

          <!-- Past orders view -->
          <div
            v-else
            class="flex flex-col gap-4 px-4 pb-10"
          >
            <div class="relative flex items-center justify-center pt-2">
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="lucide:arrow-left"
                :label="t('shop.back')"
                class="absolute left-0"
                @click="closePastOrders"
              />
              <h2 class="text-lg font-semibold text-neutral-900">
                {{ t('shop.pastOrders') }}
              </h2>
            </div>

            <UTabs
              v-if="hasMultipleSessions"
              :items="[
                { label: t('shop.myOrders'), value: 'my', slot: 'my' },
                { label: t('shop.everyonesOrders'), value: 'all', slot: 'all' }
              ]"
              class="w-full"
            >
              <template #my>
                <div class="max-h-64 space-y-4 overflow-y-auto py-2">
                  <template v-if="myPastOrders.length === 0">
                    <p class="text-sm text-neutral-500">
                      {{ t('shop.noPastOrders') }}
                    </p>
                  </template>
                  <div
                    v-for="order in myPastOrders"
                    :key="order.id"
                    class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm"
                  >
                    <p class="font-medium text-neutral-700">
                      {{ formatOrderDate(order.created_at) }}
                    </p>
                    <ul class="mt-2 space-y-1 text-neutral-600">
                      <li
                        v-for="oi in order.order_items"
                        :key="oi.id"
                      >
                        {{ orderItemName(oi) }} × {{ oi.quantity }}
                      </li>
                    </ul>
                    <p class="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                      {{ order.total_amount != null ? formatPrice(order.total_amount) : '—' }}
                    </p>
                  </div>
                </div>
              </template>
              <template #all>
                <div class="max-h-64 space-y-4 overflow-y-auto py-2">
                  <template v-if="allPastOrders.length === 0">
                    <p class="text-sm text-neutral-500">
                      {{ t('shop.noPastOrders') }}
                    </p>
                  </template>
                  <div
                    v-for="order in allPastOrders"
                    :key="order.id"
                    class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm"
                  >
                    <p class="font-medium text-neutral-700">
                      {{ formatOrderDate(order.created_at) }}
                    </p>
                    <ul class="mt-2 space-y-1 text-neutral-600">
                      <li
                        v-for="oi in order.order_items"
                        :key="oi.id"
                      >
                        {{ orderItemName(oi) }} × {{ oi.quantity }}
                      </li>
                    </ul>
                    <p class="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                      {{ order.total_amount != null ? formatPrice(order.total_amount) : '—' }}
                    </p>
                  </div>
                </div>
              </template>
            </UTabs>

            <div
              v-else
              class="max-h-64 space-y-4 overflow-y-auto py-2"
            >
              <template v-if="myPastOrders.length === 0">
                <p class="text-sm text-neutral-500">
                  {{ t('shop.noPastOrders') }}
                </p>
              </template>
              <div
                v-for="order in myPastOrders"
                :key="order.id"
                class="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm"
              >
                <p class="font-medium text-neutral-700">
                  {{ formatOrderDate(order.created_at) }}
                </p>
                <ul class="mt-2 space-y-1 text-neutral-600">
                  <li
                    v-for="oi in order.order_items"
                    :key="oi.id"
                  >
                    {{ orderItemName(oi) }} × {{ oi.quantity }}
                  </li>
                </ul>
                <p class="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
                  {{ order.total_amount != null ? formatPrice(order.total_amount) : '—' }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </UDrawer>
    </div>
  </div>
</template>
