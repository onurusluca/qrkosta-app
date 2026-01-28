<script setup lang="ts">
const { locale } = useI18n()

export type MenuCategory = {
  id: string
  name: unknown
  sort_order?: number | null
}

export type MenuItem = {
  id: string
  category_id: string
  name: unknown
  description: unknown
  price: number
  discount_price?: number | null
  photo_urls?: string[] | null
}

export type CartLine = { item_id: string, quantity: number }

const props = withDefaults(
  defineProps<{
    categories: MenuCategory[]
    items: MenuItem[]
    orderable?: boolean
    modelValue?: CartLine[]
  }>(),
  { orderable: false, modelValue: () => [] }
)

const emit = defineEmits<{ (e: 'update:modelValue', value: CartLine[]): void }>()

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

const firstCategoryId = computed(() => props.categories[0]?.id ?? '')

const activeCategoryId = ref(firstCategoryId.value)
const stickyHeight = 52

function getSectionId(catId: string) {
  return `category-${catId}`
}

function updateActiveFromScroll() {
  if (import.meta.server) return
  const scrollY = window.scrollY ?? document.documentElement.scrollTop
  const threshold = stickyHeight + 16
  let active = firstCategoryId.value
  for (const cat of props.categories) {
    const el = document.getElementById(getSectionId(cat.id))
    if (!el) continue
    const top = el.getBoundingClientRect().top + scrollY
    if (top <= scrollY + threshold) active = cat.id
  }
  activeCategoryId.value = active
}

onMounted(() => {
  const hash = window.location.hash.slice(1)
  const fromHash = props.categories.find(c => getSectionId(c.id) === hash)?.id
  activeCategoryId.value = fromHash ?? firstCategoryId.value
  window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
  nextTick(updateActiveFromScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveFromScroll)
})

function itemsForCategory(categoryId: string): MenuItem[] {
  return props.items.filter(i => i.category_id === categoryId)
}

const cartQty = (itemId: string) => {
  const line = (props.modelValue ?? []).find(l => l.item_id === itemId)
  return line?.quantity ?? 0
}

function add(itemId: string) {
  const next = [...(props.modelValue ?? [])]
  const i = next.findIndex(l => l.item_id === itemId)
  if (i >= 0) next[i]!.quantity += 1
  else next.push({ item_id: itemId, quantity: 1 })
  emit('update:modelValue', next)
}

function remove(itemId: string) {
  const line = (props.modelValue ?? []).find(l => l.item_id === itemId)
  if (!line) return
  if (line.quantity <= 1) {
    emit('update:modelValue', (props.modelValue ?? []).filter(l => l.item_id !== itemId))
    return
  }
  emit('update:modelValue', (props.modelValue ?? []).map(l =>
    l.item_id === itemId ? { ...l, quantity: l.quantity - 1 } : l
  ))
}
</script>

<template>
  <div
    v-if="categories.length"
    class="-mx-4"
  >
    <!-- Sticky anchor tabs -->
    <nav
      class="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b flex gap-0 shrink-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Menu categories"
    >
      <a
        v-for="cat in categories"
        :key="cat.id"
        :href="`#${getSectionId(cat.id)}`"
        class="shrink-0 px-3 py-2 text-sm font-bold transition-colors rounded-t-md whitespace-nowrap scroll-mt-14"
        :class="activeCategoryId === cat.id
          ? 'bg-primary/15 text-primary'
          : 'text-muted hover:text-default hover:bg-muted/50'"
      >
        {{ getName(cat.name) || '—' }}
      </a>
    </nav>

    <!-- All categories and items as scrollable sections -->
    <section
      v-for="cat in categories"
      :id="getSectionId(cat.id)"
      :key="cat.id"
      class="scroll-mt-14"
      :class="cat.id === categories[categories.length - 1]?.id ? 'pt-4 pb-32 space-y-3' : 'py-4 space-y-3'"
    >
      <h2 class="text-lg font-semibold text-dimmed px-1 mb-2">
        {{ getName(cat.name) || '—' }}
      </h2>
      <div
        v-for="item in itemsForCategory(cat.id)"
        :key="item.id"
        class="flex gap-3 rounded-lg p-3 bg-elevated/50"
      >
        <div
          v-if="item.photo_urls?.[0]"
          class="shrink-0 size-20 rounded-md overflow-hidden bg-muted"
        >
          <NuxtImg
            provider="bunny"
            :src="item.photo_urls[0]"
            :alt="getName(item.name)"
            width="80"
            height="80"
            quality="80"
            class="size-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-default truncate">
            {{ getName(item.name) }}
          </p>
          <p
            v-if="getName(item.description as object)"
            class="text-sm text-muted line-clamp-2 mt-0.5"
          >
            {{ getName(item.description as object) }}
          </p>
          <div class="flex items-center justify-between gap-2 mt-1">
            <p class="text-sm font-medium text-default">
              <template v-if="item.discount_price">
                <span class="text-primary">{{ formatPrice(item.discount_price) }}</span>
                <span class="text-muted line-through ml-1">{{ formatPrice(item.price) }}</span>
              </template>
              <template v-else>
                {{ formatPrice(item.price) }}
              </template>
            </p>
            <div
              v-if="orderable"
              class="shrink-0 flex items-center gap-0.5"
            >
              <template v-if="cartQty(item.id) > 0">
                <UButton
                  variant="soft"
                  size="xs"
                  color="primary"
                  icon="lucide:minus"
                  :aria-label="`Remove one`"
                  @click="remove(item.id)"
                />
                <span class="min-w-5 text-center text-sm tabular-nums">
                  {{ cartQty(item.id) }}
                </span>
                <UButton
                  variant="soft"
                  size="xs"
                  color="primary"
                  icon="lucide:plus"
                  :aria-label="`Add one`"
                  @click="add(item.id)"
                />
              </template>
              <UButton
                v-else
                variant="soft"
                size="xs"
                color="primary"
                icon="lucide:plus"
                @click="add(item.id)"
              >
                Add
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
