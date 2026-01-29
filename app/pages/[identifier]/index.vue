<script setup lang="ts">
import type { Database } from '~/types/database.types'

/** Options only: what to show, order, styling, layout. All content from shop. */
type Shop = Database['public']['Tables']['shops']['Row'] & { bio_options?: BioOptions | null }
interface BioOptions {
  button_order?: string[] | null // e.g. ['menu','book','map','contact']; which to show + order
  show_social?: boolean | null
  layout?: string | null
  button_style?: string | null
}

const BIO_ICONS: Record<string, string> = {
  menu: 'lucide:utensils',
  book: 'lucide:calendar-days',
  map: 'lucide:map-pin',
  email: 'lucide:mail',
  contact: 'lucide:phone'
}

interface BioButtonRow {
  labelKey: string
  url: string
  type: string
  icon: string
}

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
  `shop-bio-${identifier.value}`,
  () => $fetch<{ slug?: string, shop?: Shop }>(`/api/shop/${identifier.value}`),
  { watch: [identifier], server: true }
)

const redirectToSlug = computed(() => payload.value && 'slug' in payload.value && payload.value.slug && !('shop' in payload.value && payload.value.shop))
if (redirectToSlug.value && payload.value && 'slug' in payload.value) {
  await navigateTo(`/${payload.value.slug}?utm_source=qr-code`, { replace: true })
}
watch(redirectToSlug, (v) => {
  if (v && payload.value && 'slug' in payload.value) {
    navigateTo(`/${payload.value.slug}?utm_source=qr-code`, { replace: true })
  }
}, { immediate: true })

const shop = computed(() => ('shop' in (payload.value || {}) ? payload.value?.shop : null) as Shop | null)

/** Japanese-style: 〒postal_code prefecture city town street building, or formatted fallback */
function formatAddress(addr: import('~/types/database.types').Json | null | undefined): string {
  if (addr == null) return ''
  const o = addr as Record<string, string | undefined>
  if (o.formatted) return o.formatted
  const parts: string[] = []
  if (o.postal_code) parts.push(`〒${String(o.postal_code).replace(/(\d{3})(\d{4})/, '$1-$2')}`)
  if (o.prefecture) parts.push(o.prefecture)
  if (o.city) parts.push(o.city)
  if (o.town) parts.push(o.town)
  if (o.street) parts.push(o.street)
  if (o.building) parts.push(o.building)
  return parts.join(' ') || ''
}

const formattedAddress = computed(() => formatAddress(shop.value?.address ?? null))

const bioButtons = computed((): BioButtonRow[] => {
  const s = shop.value
  if (!s) return []
  const base = `/${identifier.value}`
  const all: BioButtonRow[] = [
    { labelKey: 'shop.bioMenu', url: `${base}/menu`, type: 'menu', icon: BIO_ICONS.menu! }
  ]
  // Booking not yet: if (s.website_url) all.push({ labelKey: 'shop.bioBook', url: s.website_url, type: 'book', icon: BIO_ICONS.book! })
  if (s.google_maps_url) all.push({ labelKey: 'shop.bioFindUs', url: s.google_maps_url, type: 'map', icon: BIO_ICONS.map! })
  if (s.email) all.push({ labelKey: 'shop.bioWriteUs', url: `mailto:${s.email}`, type: 'email', icon: BIO_ICONS.email! })
  if (s.phone) all.push({ labelKey: 'shop.bioContact', url: `tel:${s.phone}`, type: 'contact', icon: BIO_ICONS.contact! })
  const order = shop.value?.bio_options?.button_order
  if (Array.isArray(order) && order.length > 0) {
    const byType = new Map(all.map(b => [b.type, b]))
    return order.map(type => byType.get(type)).filter(Boolean) as BioButtonRow[]
  }
  return all
})

const brandColor = computed(() => {
  const c = shop.value?.brand_color
  if (!c || !/^#[0-9A-Fa-f]{6}$/.test(c)) return null
  return c
})
const socialLinks = computed(() => {
  const s = shop.value
  if (!s) return []
  const links: { icon: string, url: string, label: string }[] = []
  if (s.instagram_url) links.push({ icon: 'lucide:instagram', url: s.instagram_url, label: 'Instagram' })
  if (s.twitter_url) links.push({ icon: 'lucide:twitter', url: s.twitter_url, label: 'Twitter' })
  if (s.line_url) links.push({ icon: 'simple-icons:line', url: s.line_url, label: 'LINE' })
  return links
})

function isExternal(url: string): boolean {
  return url.startsWith('http') || url.startsWith('tel:') || url.startsWith('mailto:')
}

const canShare = ref(false)
onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

async function handleShare() {
  if (!canShare.value || !navigator.share) return
  try {
    await navigator.share({
      title: shop.value ? localeText(shop.value.name as import('~/types/database.types').Json) : 'Shop',
      url: window.location.href
    })
  } catch {
    // User cancelled or error
  }
}

const config = useRuntimeConfig().public as { BUNNY_CDN_URL?: string }
function fullCdnUrl(path: string): string {
  if (path.startsWith('http')) return path
  const base = (config.BUNNY_CDN_URL ?? 'https://qrkosta.b-cdn.net').replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return `${base}/${p}`
}

useHead({
  title: () => (shop.value ? localeText(shop.value.name as import('~/types/database.types').Json) : t('shop.title')),
  link: () =>
    shop.value?.logo_url
      ? [{ rel: 'icon', href: fullCdnUrl(shop.value.logo_url), key: 'favicon' }]
      : []
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
        <div
          class="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10"
          :style="brandColor ? { '--brand': brandColor } : undefined"
        >
          <!-- Logo: preserve aspect (not forced square), name only -->
          <div class="flex flex-col items-center text-center">
            <NuxtImg
              v-if="shop.logo_url"
              :src="shop.logo_url"
              alt=""
              class="mb-5 max-h-24 w-auto max-w-[200px] shrink-0 object-contain"
              loading="lazy"
              provider="bunny"
            />
            <h1 class="text-xl font-medium tracking-tight text-neutral-900">
              {{ localeText(shop.name) }}
            </h1>
          </div>

          <!-- Buttons with icons; brand used sparingly for icon/hover -->
          <div class="mt-10 flex flex-col gap-2.5">
            <template
              v-for="(btn, i) in bioButtons"
              :key="i"
            >
              <NuxtLink
                v-if="!isExternal(btn.url)"
                :to="btn.url"
                class="bio-btn flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 text-left font-normal text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <UIcon
                  :name="btn.icon"
                  class="size-5 shrink-0"
                  :class="brandColor ? 'text-(--brand)' : 'text-neutral-500'"
                />
                <span>{{ t(btn.labelKey) }}</span>
              </NuxtLink>
              <a
                v-else
                :href="btn.url"
                target="_blank"
                rel="noopener noreferrer"
                class="bio-btn flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3.5 text-left font-normal text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <UIcon
                  :name="btn.icon"
                  class="size-5 shrink-0"
                  :class="brandColor ? 'text-(--brand)' : 'text-neutral-500'"
                />
                <span>{{ t(btn.labelKey) }}</span>
              </a>
            </template>
          </div>

          <!-- Social: no gap, bigger icons -->
          <div
            v-if="socialLinks.length > 0 && (shop.bio_options?.show_social !== false)"
            class="mt-12 flex justify-center gap-0 border-t border-neutral-100 pt-8"
          >
            <a
              v-for="link in socialLinks"
              :key="link.label"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 text-neutral-400 transition hover:text-neutral-600"
              :aria-label="link.label"
            >
              <UIcon
                :name="link.icon"
                class="size-8"
              />
            </a>
          </div>

          <!-- Address, plain text (Find Us is a button above) -->
          <p
            v-if="formattedAddress"
            class="mt-8 text-center text-sm text-neutral-500"
          >
            {{ formattedAddress }}
          </p>

          <!-- Language + share, just under address -->
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <LanguageChanger />
            <UButton
              v-if="canShare"
              icon="lucide:share-2"
              color="neutral"
              variant="ghost"
              size="sm"
              :label="t('shop.share')"
              @click="handleShare"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
