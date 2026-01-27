<script setup lang="ts">
const { t } = useI18n()
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

const categories = computed(() => props.menuData?.categories ?? [])
const items = computed(() => props.menuData?.items ?? [])

const copied = ref(false)
const effectiveUrl = computed(() =>
  props.shareUrl || (import.meta.client && typeof window !== 'undefined' ? window.location.href : '')
)
const copyLink = async () => {
  if (!effectiveUrl.value) return
  try {
    await navigator.clipboard.writeText(effectiveUrl.value)
    copied.value = true
    const resetCopied = () => (copied.value = false)
    setTimeout(resetCopied, 2000)
  } catch {
    // Clipboard may be unavailable
  }
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

      <!-- Menu (read-only on shop home) -->
      <ShopMenu
        v-if="categories.length"
        :categories="categories"
        :items="items"
        :orderable="false"
      />
      <div
        v-else
        class="py-8 text-center text-muted text-sm"
      >
        {{ t('shopHome.noMenu') }}
      </div>
    </div>
  </div>
</template>
