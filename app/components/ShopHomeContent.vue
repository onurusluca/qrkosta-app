<script setup lang="ts">
const { t, locale } = useI18n()
const props = withDefaults(
  defineProps<{
    shop?: {
      name: string
      logo_url?: string | null
      slug: string
      address?: unknown
      phone?: string | null
      email?: string | null
      google_maps_url?: string | null
      website_url?: string | null
    } | null
    menuData?: { categories: Array<{ id: string, name: unknown, sort_order?: number | null }>, items: Array<{ id: string, category_id: string, name: unknown, description: unknown, price: number, discount_price?: number | null, photo_urls?: string[] | null }> }
    shareUrl?: string
  }>(),
  { shop: undefined, menuData: () => ({ categories: [], items: [] }), shareUrl: '' }
)

function getName(obj: unknown): string {
  if (typeof obj === 'string') return obj
  if (!obj || typeof obj !== 'object') return ''
  const o = obj as Record<string, unknown>
  const lang = locale.value === 'ja' ? 'ja' : 'en'
  if (typeof o[lang] === 'string') return o[lang] as string
  if (typeof o.en === 'string') return o.en
  if (typeof o.ja === 'string') return o.ja
  return ''
}

function formatPrice(n: number): string {
  return `¥${n.toLocaleString()}`
}

const tabItems = computed(() =>
  (props.menuData?.categories ?? []).map(c => ({
    label: getName(c.name) || '—',
    value: c.id,
    slot: c.id
  }))
)

const firstCategoryId = computed(() => (props.menuData?.categories ?? [])[0]?.id ?? '')

function itemsForCategory(categoryId: string) {
  return (props.menuData?.items ?? []).filter(i => i.category_id === categoryId)
}

const copied = ref(false)
const effectiveUrl = computed(() =>
  props.shareUrl || (import.meta.client && typeof window !== 'undefined' ? window.location.href : '')
)
const copyLink = async () => {
  if (!effectiveUrl.value) return
  try {
    await navigator.clipboard.writeText(effectiveUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>

<template>
  <div
    v-if="shop"
    class="min-h-screen flex flex-col"
  >
    <div class="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
      <!-- Compact header -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            v-if="shop.logo_url"
            class="shrink-0 rounded-lg overflow-hidden shadow-sm size-14"
          >
            <NuxtImg
              provider="bunny"
              :src="shop.logo_url"
              :alt="shop.name"
              width="56"
              height="56"
              quality="80"
              class="size-full object-cover"
              loading="eager"
            />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl font-semibold text-default truncate">
              {{ shop.name }}
            </h1>
            <p
              v-if="shop.address && typeof shop.address === 'object' && 'city' in (shop.address as object)"
              class="text-sm text-muted truncate"
            >
              {{ (shop.address as { city?: string }).city }}
            </p>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <CommonLocaleChanger />
          <UButton
            variant="ghost"
            size="sm"
            :color="copied ? 'success' : 'neutral'"
            icon="lucide:share-2"
            @click="copyLink"
          />
        </div>
      </div>

      <!-- Contact row (icons only) -->
      <div
        v-if="shop.phone || shop.google_maps_url || shop.website_url"
        class="flex items-center gap-2"
      >
        <UButton
          v-if="shop.phone"
          variant="ghost"
          size="xs"
          icon="lucide:phone"
          :to="`tel:${shop.phone}`"
          target="_blank"
        />
        <UButton
          v-if="shop.google_maps_url"
          variant="ghost"
          size="xs"
          icon="lucide:map-pin"
          :to="shop.google_maps_url"
          target="_blank"
        />
        <UButton
          v-if="shop.website_url"
          variant="ghost"
          size="xs"
          icon="lucide:globe"
          :to="shop.website_url"
          target="_blank"
        />
      </div>

      <!-- Sticky tabs -->
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
            v-for="cat in (menuData?.categories ?? [])"
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
                  <p class="text-sm font-medium text-default mt-1">
                    <template v-if="item.discount_price">
                      <span class="text-primary">{{ formatPrice(item.discount_price) }}</span>
                      <span class="text-muted line-through ml-1">{{ formatPrice(item.price) }}</span>
                    </template>
                    <template v-else>
                      {{ formatPrice(item.price) }}
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
      <div
        v-else
        class="py-8 text-center text-muted text-sm"
      >
        {{ t('shopHome.noMenu') }}
      </div>
    </div>
  </div>
</template>
