<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Shop = Database['public']['Tables']['shops']['Row']
type Menu = Pick<Database['public']['Tables']['menus']['Row'], 'id' | 'short_id' | 'name' | 'type' | 'sort_order'>

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
  `shop-menus-${identifier.value}`,
  () => $fetch<{ slug?: string, shop?: Shop, menus?: Menu[] }>(`/api/shop/${identifier.value}/menus`),
  { watch: [identifier], server: true }
)

const redirectToSlug = computed(() => payload.value && 'slug' in payload.value && payload.value.slug && !('shop' in payload.value && payload.value.shop))
if (redirectToSlug.value && payload.value && 'slug' in payload.value) {
  await navigateTo(`/${payload.value.slug}/menus?utm_source=qr-code`, { replace: true })
}
watch(redirectToSlug, (v) => {
  if (v && payload.value && 'slug' in payload.value) {
    navigateTo(`/${payload.value.slug}/menus?utm_source=qr-code`, { replace: true })
  }
}, { immediate: true })

const shop = computed(() => ('shop' in (payload.value || {}) ? payload.value?.shop : null) as Shop | null)
const menus = computed(() => ((payload.value && 'menus' in payload.value ? payload.value.menus : []) || []) as Menu[])

useHead({
  title: () => (shop.value ? localeText(shop.value.name as import('~/types/database.types').Json) + ' – ' + t('shop.menusTitle') : t('shop.menusTitle'))
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
              <p class="mt-1 text-sm text-neutral-500">
                {{ t('shop.menusTitle') }}
              </p>
            </div>
          </div>
        </header>

        <main class="mx-auto max-w-lg px-4 py-6">
          <p
            v-if="menus.length === 0"
            class="text-center text-neutral-500"
          >
            {{ t('shop.noMenus') }}
          </p>
          <ul
            v-else
            class="flex flex-col gap-3"
          >
            <li
              v-for="m in menus"
              :key="m.id"
            >
              <NuxtLink
                :to="`/${identifier}/menu/${m.short_id}`"
                class="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-sm transition hover:border-neutral-300 hover:shadow"
              >
                <span class="font-medium text-neutral-900">
                  {{ localeText(m.name) }}
                </span>
                <UIcon
                  name="lucide:chevron-right"
                  class="size-5 text-neutral-400"
                />
              </NuxtLink>
            </li>
          </ul>
        </main>
      </template>
    </template>
  </div>
</template>
