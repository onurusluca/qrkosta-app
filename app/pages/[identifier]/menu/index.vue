<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Shop = Database['public']['Tables']['shops']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

const route = useRoute()
const { t, locale } = useI18n()
const identifier = computed(() => route.params.identifier as string)
const isPreview = computed(() => route.query.qrkprev56mv1024vl === '1')

function isShortId(id: string) {
  return /^[A-Za-z0-9]{5}$/.test(id)
}

function localeText(val: import('~/types/database.types').Json | null | undefined): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  const o = val as Record<string, string>
  return o[locale.value] ?? o.en ?? o.ja ?? Object.values(o)[0] ?? ''
}

type MenuPayload = { slug?: string, shop?: Shop | null, menu?: unknown, categories: MenuCategory[], items: MenuItem[], variants: MenuItemVariant[] }
const { data: payload, error, pending } = await useAsyncData(
  `shop-menu-${identifier.value}-${String(route.query.menu_id)}`,
  () => {
    const menuId = route.query.menu_id
    const q = typeof menuId === 'string' && menuId ? `?menu_id=${encodeURIComponent(menuId)}` : ''
    return $fetch<MenuPayload>(`/api/shop/${identifier.value}${q}`)
  },
  { watch: [identifier, () => route.query.menu_id], server: true }
)

const redirectToSlug = computed(() => !isPreview.value && payload.value && 'slug' in payload.value && payload.value.slug && !('shop' in payload.value && payload.value.shop))
if (redirectToSlug.value && payload.value && 'slug' in payload.value) {
  await navigateTo(`/${payload.value.slug}/menu?utm_source=qr-code`, { replace: true })
}
watch(redirectToSlug, (v) => {
  if (v && payload.value && 'slug' in payload.value) {
    navigateTo(`/${payload.value.slug}/menu?utm_source=qr-code`, { replace: true })
  }
}, { immediate: true })

const previewPayload = ref<{ shop: Shop | null, categories: MenuCategory[], items: MenuItem[], variants: MenuItemVariant[] } | null>(null)
// @ts-expect-error useAsyncData + computed causes "excessively deep" type instantiation
const shop = computed<Shop | null>(() => {
  if (isPreview.value && previewPayload.value) return previewPayload.value.shop
  const raw = payload.value
  if (!raw || typeof raw !== 'object' || !('shop' in raw)) return null
  const s = (raw as { shop: Shop | null | undefined }).shop
  return s ?? null
})
const categories = computed<MenuCategory[]>(() => {
  if (isPreview.value && previewPayload.value) return previewPayload.value.categories
  const p = payload.value
  return (p && 'categories' in p ? p.categories : []) || []
})
const items = computed<MenuItem[]>(() => {
  if (isPreview.value && previewPayload.value) return previewPayload.value.items
  const p = payload.value
  return (p && 'items' in p ? p.items : []) || []
})
const variants = computed<MenuItemVariant[]>(() => {
  if (isPreview.value && previewPayload.value) return previewPayload.value.variants
  const p = payload.value
  return (p && 'variants' in p ? p.variants : []) || []
})

onMounted(() => {
  if (!isPreview.value) return
  const allowedOrigin = (useRuntimeConfig().public as { PREVIEW_ORIGIN?: string }).PREVIEW_ORIGIN || ''
  const handler = (event: MessageEvent) => {
    if (allowedOrigin && event.origin !== allowedOrigin) return
    if (event.data?.type === 'preview' && event.data?.payload) {
      const p = event.data.payload as { shop?: Shop | null, categories?: MenuCategory[], items?: MenuItem[], variants?: MenuItemVariant[] }
      previewPayload.value = {
        shop: p.shop ?? null,
        categories: Array.isArray(p.categories) ? p.categories : [],
        items: Array.isArray(p.items) ? p.items : [],
        variants: Array.isArray(p.variants) ? p.variants : []
      }
    }
  }
  window.addEventListener('message', handler)
  onUnmounted(() => window.removeEventListener('message', handler))
})

const menusUrl = computed(() => `/${identifier.value}/menus`)

useHead({
  title: () => (shop.value ? localeText(shop.value.name as import('~/types/database.types').Json) : t('shop.title'))
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <div
      v-if="isShortId(identifier)"
      class="flex min-h-screen items-center justify-center"
    >
      <UIcon
        name="lucide:loader-2"
        class="size-8 animate-spin text-neutral-400"
      />
    </div>

    <template v-else>
      <div
        v-if="error"
        class="flex min-h-screen flex-col items-center justify-center gap-4 px-4"
      >
        <UIcon
          name="lucide:store"
          class="size-16 text-neutral-300"
        />
        <p class="text-center text-neutral-600">
          {{ (error as { statusMessage?: string })?.statusMessage === 'Shop not found' ? t('shop.notFound') : t('shop.error') }}
        </p>
      </div>

      <div
        v-else-if="pending && !shop"
        class="flex min-h-screen items-center justify-center"
      >
        <UIcon
          name="lucide:loader-2"
          class="size-8 animate-spin text-neutral-400"
        />
      </div>

      <template v-else-if="shop">
        <header class="border-b border-neutral-200 bg-white px-4 py-4">
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 pb-2">
            <NuxtLink
              :to="menusUrl"
              class="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              <UIcon
                name="lucide:list"
                class="size-4"
              />
              {{ t('shop.seeAllMenus') }}
            </NuxtLink>
            <div class="flex gap-2">
              <LanguageChanger />
              <CurrencyChanger />
            </div>
          </div>
          <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div
              v-if="shop.logo_url"
              class="flex h-20 max-h-20 w-32 max-w-32 shrink-0 items-center justify-center overflow-hidden"
            >
              <NuxtImg
                :src="shop.logo_url"
                alt=""
                class="h-full max-h-full w-full max-w-full object-contain"
                loading="lazy"
                provider="bunny"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                {{ localeText(shop.name) }}
              </h1>
              <p
                v-if="shop.address && typeof shop.address === 'object' && 'formatted' in shop.address"
                class="mt-1 text-sm text-neutral-500"
              >
                {{ (shop.address as { formatted?: string }).formatted }}
              </p>
              <div
                v-if="shop.phone || shop.email"
                class="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-neutral-500 sm:justify-start"
              >
                <a
                  v-if="shop.phone"
                  :href="`tel:${shop.phone}`"
                  class="hover:text-neutral-700"
                >{{ shop.phone }}</a>
                <a
                  v-if="shop.email"
                  :href="`mailto:${shop.email}`"
                  class="hover:text-neutral-700"
                >{{ shop.email }}</a>
              </div>
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
        />
      </template>
    </template>
  </div>
</template>
