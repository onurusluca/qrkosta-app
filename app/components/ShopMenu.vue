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

export type CartLine = { item_id: string; quantity: number }

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

const tabItems = computed(() =>
  props.categories.map(c => ({
    label: getName(c.name) || '—',
    value: c.id,
    slot: c.id
  }))
)

const firstCategoryId = computed(() => props.categories[0]?.id ?? '')

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
    v-if="tabItems.length"
    class="-mx-4"
  >
    <UTabs
      :items="tabItems"
      :default-value="firstCategoryId"
      variant="link"
      color="neutral"
      size="sm"
      :ui="{
        list: 'overflow-x-auto overflow-y-hidden sticky top-0 z-10 bg-background/95 backdrop-blur border-b -mb-px',
        trigger: 'shrink-0 grow-0'
      }"
      class="w-full"
    >
      <template
        v-for="cat in categories"
        :key="cat.id"
        #[cat.id]
      >
        <div class="py-4 space-y-3">
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
                  <UButton
                    v-if="cartQty(item.id) > 0"
                    variant="ghost"
                    size="xs"
                    color="primary"
                    icon="lucide:minus"
                    :aria-label="`Remove one`"
                    @click="remove(item.id)"
                  />
                  <span
                    v-if="cartQty(item.id) > 0"
                    class="min-w-5 text-center text-sm tabular-nums"
                  >
                    {{ cartQty(item.id) }}
                  </span>
                  <UButton
                    variant="ghost"
                    size="xs"
                    color="primary"
                    icon="lucide:plus"
                    :aria-label="`Add one`"
                    @click="add(item.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>
