<script setup lang="ts">
import type { Database } from '~/types/database.types'

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

export type CartLine = { menuItemId: string, variantId?: string, quantity: number, price: number }

const props = withDefaults(
  defineProps<{
    categories: MenuCategory[]
    items: MenuItem[]
    variants: MenuItemVariant[]
    orderable?: boolean
    cart?: CartLine[]
  }>(),
  { orderable: false, cart: () => [] }
)

const emit = defineEmits<{
  add: [payload: { menuItemId: string, variantId?: string, quantity: number, price: number }]
  remove: [payload: { menuItemId: string, variantId?: string }]
}>()

function getQty(menuItemId: string, variantId?: string): number {
  const line = props.cart.find(l => l.menuItemId === menuItemId && l.variantId === variantId)
  return line?.quantity ?? 0
}

const { locale } = useI18n()
const { formatPrice } = useCurrency()

function localeText(val: import('~/types/database.types').Json | null | undefined): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  const o = val as Record<string, string>
  return o[locale.value] ?? o.en ?? o.ja ?? Object.values(o)[0] ?? ''
}

const itemsByCategory = computed(() => {
  const map = new Map<string, MenuItem[]>()
  for (const item of props.items) {
    const list = map.get(item.category_id) ?? []
    list.push(item)
    map.set(item.category_id, list)
  }
  return map
})

const variantsByItemId = computed(() => {
  const map = new Map<string, MenuItemVariant[]>()
  for (const v of props.variants) {
    const list = map.get(v.menu_item_id) ?? []
    list.push(v)
    map.set(v.menu_item_id, list)
  }
  return map
})

const activeCategoryId = ref<string | null>(null)
const tabScrollRef = ref<HTMLElement | null>(null)

watch(() => props.categories[0]?.id, (id) => {
  if (id && !activeCategoryId.value) activeCategoryId.value = id
}, { immediate: true })

let scrollObserver: IntersectionObserver | null = null
onMounted(() => {
  if (!props.categories.length) return
  scrollObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const id = e.target.id?.replace('category-', '')
        if (id) activeCategoryId.value = id
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  )
  props.categories.forEach((c) => {
    const el = document.getElementById(`category-${c.id}`)
    if (el) scrollObserver?.observe(el)
  })
})
onUnmounted(() => scrollObserver?.disconnect())

watch(activeCategoryId, () => {
  nextTick(() => {
    const scrollEl = tabScrollRef.value
    if (!scrollEl || !activeCategoryId.value) return
    const tab = scrollEl.querySelector<HTMLElement>(`[data-category-id="${activeCategoryId.value}"]`)
    if (!tab) return
    const left = tab.offsetLeft
    const width = tab.offsetWidth
    const scrollLeft = scrollEl.scrollLeft
    const clientWidth = scrollEl.clientWidth
    if (left < scrollLeft) scrollEl.scrollTo({ left, behavior: 'instant' })
    else if (left + width > scrollLeft + clientWidth) scrollEl.scrollTo({ left: left + width - clientWidth, behavior: 'instant' })
  })
}, { flush: 'post' })

function scrollToCategory(id: string) {
  activeCategoryId.value = id
  document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'instant', block: 'start' })
}

function addItem(item: MenuItem, variant?: MenuItemVariant) {
  const price = variant ? variant.price : item.price
  emit('add', { menuItemId: item.id, variantId: variant?.id, quantity: 1, price })
}

function removeItem(menuItemId: string, variantId?: string) {
  emit('remove', { menuItemId, variantId })
}
</script>

<template>
  <div
    v-if="!categories.length"
    class="py-12 text-center text-neutral-500"
  >
    <slot name="empty">
      {{ $t('shop.noMenu') }}
    </slot>
  </div>
  <template v-else>
    <div class="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav
        ref="tabScrollRef"
        class="flex gap-1 overflow-x-auto px-4 py-3 scrollbar-none"
        aria-label="Menu categories"
      >
        <UButton
          v-for="cat in categories"
          :key="cat.id"
          :data-category-id="cat.id"
          :label="localeText(cat.name)"
          :color="activeCategoryId === cat.id ? 'primary' : 'neutral'"
          :variant="activeCategoryId === cat.id ? 'solid' : 'ghost'"
          size="sm"
          class="shrink-0 rounded-full"
          @click="scrollToCategory(cat.id)"
        />
      </nav>
    </div>
    <main class="px-2 py-6 pb-12">
      <section
        v-for="cat in categories"
        :id="`category-${cat.id}`"
        :key="cat.id"
        class="scroll-mt-24 pt-8 first:pt-0"
      >
        <h2 class="mb-4 text-lg font-semibold text-neutral-900">
          {{ localeText(cat.name) }}
        </h2>
        <ul class="space-y-4">
          <li
            v-for="item in (itemsByCategory.get(cat.id) ?? [])"
            :key="item.id"
            class="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-neutral-900">
                {{ localeText(item.name) }}
              </h3>
              <p
                v-if="localeText(item.description)"
                class="mt-1 text-sm text-neutral-500"
              >
                {{ localeText(item.description) }}
              </p>
              <div class="mt-2 flex flex-wrap items-baseline gap-2">
                <span class="font-semibold text-neutral-900">{{ formatPrice(item.price) }}</span>
                <template
                  v-for="v in (variantsByItemId.get(item.id) ?? [])"
                  :key="v.id"
                >
                  <span class="text-sm text-neutral-500">{{ localeText(v.name) }} {{ formatPrice(v.price) }}</span>
                </template>
              </div>
              <div
                v-if="orderable"
                class="mt-3 flex flex-wrap justify-end gap-2"
              >
                <template v-if="getQty(item.id) > 0">
                  <div class="inline-flex items-center rounded-lg border border-neutral-300 bg-white">
                    <UButton
                      icon="lucide:minus"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      class="size-8 shrink-0 rounded-l-md rounded-r-none"
                      aria-label="Decrease"
                      @click="removeItem(item.id)"
                    />
                    <span class="min-w-6 py-1 text-center text-sm font-medium">{{ getQty(item.id) }}</span>
                    <UButton
                      icon="lucide:plus"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      class="size-8 shrink-0 rounded-l-none rounded-r-md"
                      aria-label="Increase"
                      @click="addItem(item)"
                    />
                  </div>
                </template>
                <template v-else>
                  <UButton
                    :label="$t('shop.add')"
                    icon="lucide:plus"
                    color="primary"
                    variant="solid"
                    size="md"
                    @click="addItem(item)"
                  />
                </template>
                <template
                  v-for="v in (variantsByItemId.get(item.id) ?? [])"
                  :key="v.id"
                >
                  <template v-if="getQty(item.id, v.id) > 0">
                    <div class="inline-flex items-center rounded-lg border border-neutral-300 bg-white">
                      <UButton
                        icon="lucide:minus"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        class="size-8 shrink-0 rounded-l-md rounded-r-none"
                        aria-label="Decrease"
                        @click="removeItem(item.id, v.id)"
                      />
                      <span class="min-w-6 py-1 text-center text-sm font-medium">{{ getQty(item.id, v.id) }}</span>
                      <UButton
                        icon="lucide:plus"
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        class="size-8 shrink-0 rounded-l-none rounded-r-md"
                        aria-label="Increase"
                        @click="addItem(item, v)"
                      />
                    </div>
                  </template>
                  <UButton
                    v-else
                    :label="`${localeText(v.name)} ${formatPrice(v.price)}`"
                    icon="lucide:plus"
                    color="neutral"
                    variant="outline"
                    size="md"
                    @click="addItem(item, v)"
                  />
                </template>
              </div>
            </div>
            <NuxtImg
              v-if="item.photo_urls?.length"
              :src="item.photo_urls[0]"
              alt=""
              class="size-24 shrink-0 rounded-lg object-cover"
              width="96"
              height="96"
            />
          </li>
        </ul>
      </section>
    </main>
  </template>
</template>
