<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Shop = Database['public']['Tables']['shops']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemVariant = Database['public']['Tables']['menu_item_variants']['Row']

const route = useRoute()
const { t, locale } = useI18n()
const identifier = computed(() => route.params.identifier as string)

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
  `shop-menu-${identifier.value}`,
  () => $fetch<{ slug?: string, shop?: Shop, menu?: unknown, categories: MenuCategory[], items: MenuItem[], variants: MenuItemVariant[] }>(`/api/shop/${identifier.value}`),
  { watch: [identifier], server: true }
)

const redirectToSlug = computed(() => payload.value && 'slug' in payload.value && payload.value.slug && !('shop' in payload.value && payload.value.shop))
if (redirectToSlug.value && payload.value && 'slug' in payload.value) {
  await navigateTo(`/${payload.value.slug}/menu?utm_source=qr-code`, { replace: true })
}
watch(redirectToSlug, (v) => {
  if (v && payload.value && 'slug' in payload.value) {
    navigateTo(`/${payload.value.slug}/menu?utm_source=qr-code`, { replace: true })
  }
}, { immediate: true })

const shop = computed(() => ('shop' in (payload.value || {}) ? payload.value?.shop : null) as Shop | null)
const categories = computed(() => ((payload.value && 'categories' in payload.value ? payload.value.categories : []) || []) as MenuCategory[])
const items = computed(() => ((payload.value && 'items' in payload.value ? payload.value.items : []) || []) as MenuItem[])
const variants = computed(() => ((payload.value && 'variants' in payload.value ? payload.value.variants : []) || []) as MenuItemVariant[])

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
        <header class="border-b border-neutral-200 bg-white px-4 py-6">
          <div class="flex justify-end gap-2 px-4 pb-2">
            <LanguageChanger />
            <CurrencyChanger />
          </div>
          <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <NuxtImg
              v-if="shop.logo_url"
              :src="shop.logo_url"
              alt=""
              class="max-h-20 w-auto max-w-32 shrink-0 object-contain"
              loading="lazy"
              provider="bunny"
            />
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
