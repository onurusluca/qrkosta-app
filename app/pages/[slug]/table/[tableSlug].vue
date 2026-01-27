<script setup lang="ts">
type CartLine = { item_id: string; quantity: number }

const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/
const { t, locale } = useI18n()
const route = useRoute()
const slug = route.params.slug as string
const tableSlug = route.params.tableSlug as string

if (slug === 's') {
  throw createError({ statusCode: 404, message: 'Not found' })
}

const { data: shop, error: shopError } = await useFetch(`/api/shop/${slug}`)
const { data: menuData } = await useFetch(`/api/shop/${slug}/menu`)
const { data: table, error: tableError } = await useFetch(`/api/shop/${slug}/table/${tableSlug}`)

if (shopError.value || tableError.value) {
  throw createError({
    statusCode: shopError.value?.statusCode ?? tableError.value?.statusCode ?? 404,
    message: shopError.value?.message ?? tableError.value?.message ?? 'Not found'
  })
}

if (!shop.value || !table.value) {
  throw createError({ statusCode: 404, message: 'Shop or table not found' })
}

if (SHORT_ID_REGEX.test(slug) && shop.value.slug !== slug) {
  await navigateTo(
    {
      path: `/${shop.value.slug}/table/${tableSlug}`,
      query: { utm_source: 'qr', ...(route.query as Record<string, string>) }
    },
    { redirectCode: 302 }
  )
}

const categories = computed(() => menuData.value?.categories ?? [])
const items = computed(() => menuData.value?.items ?? [])
const cart = ref<CartLine[]>([])
const drawerOpen = ref(false)
const toast = useToast()

function getName(obj: unknown): string {
  if (typeof obj === 'string') return obj
  if (!obj || typeof obj !== 'object') return ''
  const o = obj as Record<string, unknown>
  const lang = locale.value === 'ja' ? 'ja' : 'en'
  if (typeof o[lang] === 'string') return o[lang] as string
  if (typeof o.en === 'string') return o.en as string
  if (typeof o.ja === 'string') return o.ja as string
  return ''
}

function formatPrice(n: number): string {
  return `¥${n.toLocaleString()}`
}

const itemCount = computed(() => cart.value.reduce((s, l) => s + l.quantity, 0))

const cartTotal = computed(() => {
  let sum = 0
  for (const line of cart.value) {
    const item = items.value.find(i => i.id === line.item_id)
    if (item) sum += (item.discount_price ?? item.price) * line.quantity
  }
  return sum
})

const cartSummaryLabel = computed(() => {
  const n = itemCount.value
  const total = formatPrice(cartTotal.value)
  return `${t('table.showMyOrder')} (${n} ${t('table.items')} · ${total})`
})

const cartLinesWithMeta = computed(() =>
  cart.value.map(line => {
    const item = items.value.find(i => i.id === line.item_id)
    const unit = item ? (item.discount_price ?? item.price) : 0
    return {
      ...line,
      name: item ? getName(item.name) : '—',
      unitPrice: unit,
      lineTotal: unit * line.quantity
    }
  })
)

const isSubmitting = ref(false)

async function submitOrder() {
  if (cart.value.length === 0 || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await $fetch(`/api/shop/${slug}/table/${tableSlug}/order`, {
      method: 'POST',
      body: {
        items: cart.value.map(l => ({ menu_item_id: l.item_id, quantity: l.quantity }))
      }
    })
    toast.add({
      title: t('table.orderSuccess'),
      color: 'success',
      icon: 'lucide:check'
    })
    cart.value = []
    drawerOpen.value = false
  } catch (_e) {
    toast.add({
      title: t('table.orderError'),
      color: 'error',
      icon: 'lucide:alert-circle'
    })
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: `${shop.value?.name ?? ''} – Table ${table.value?.table_number ?? ''}`,
  meta: [{ name: 'description', content: `Order at table ${table.value?.table_number ?? ''}` }]
})
</script>

<template>
  <div class="min-h-screen flex flex-col pb-24">
    <div class="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
      <!-- Compact header -->
      <div
        v-if="shop"
        class="flex items-center justify-between gap-3"
      >
        <h1 class="text-xl font-semibold text-default truncate">
          {{ shop.name }}
        </h1>
        <CommonLocaleChanger />
      </div>

      <!-- Orderable menu -->
      <ShopMenu
        v-if="categories.length"
        :categories="categories"
        :items="items"
        :orderable="true"
        v-model="cart"
      />
      <div
        v-else
        class="py-8 text-center text-muted text-sm"
      >
        {{ t('shopHome.noMenu') }}
      </div>
    </div>

    <!-- Cart bar + drawer (only when cart has items) -->
    <div
      v-if="cart.length > 0"
      class="fixed bottom-0 left-0 right-0 z-20 max-w-2xl mx-auto px-4 pb-4"
    >
      <UDrawer
        v-model:open="drawerOpen"
        direction="bottom"
        :handle="true"
        :ui="{ container: 'max-w-2xl mx-auto' }"
      >
        <UButton
          as="button"
          type="button"
          color="primary"
          class="w-full justify-center py-3 text-base font-medium"
          :label="cartSummaryLabel"
          trailing-icon="lucide:chevron-up"
        />
        <template #body>
          <div class="space-y-3">
            <p class="text-highlighted font-semibold">
              {{ t('table.showMyOrder') }}
            </p>
            <ul class="divide-y divide-default/50">
              <li
                v-for="line in cartLinesWithMeta"
                :key="line.item_id"
                class="py-3 flex justify-between gap-2"
              >
                <span class="text-default truncate">
                  {{ line.name }} × {{ line.quantity }}
                </span>
                <span class="text-default tabular-nums shrink-0">
                  {{ formatPrice(line.lineTotal) }}
                </span>
              </li>
            </ul>
            <p class="flex justify-between gap-2 font-semibold pt-2">
              <span>{{ t('table.total') }}</span>
              <span class="tabular-nums">{{ formatPrice(cartTotal) }}</span>
            </p>
          </div>
        </template>
        <template #footer>
          <UButton
            color="primary"
            class="w-full justify-center py-3 text-base font-semibold"
            :label="t('table.order')"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="submitOrder"
          />
        </template>
      </UDrawer>
    </div>
  </div>
</template>
