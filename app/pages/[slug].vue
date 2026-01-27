<script setup lang="ts">
const SHORT_ID_REGEX = /^[A-Za-z0-9]{4,6}$/

const route = useRoute()
const slug = route.params.slug as string

if (slug === 's') {
  throw createError({ statusCode: 404, message: 'Not found' })
}

const { data: shop, error } = await useFetch(`/api/shop/${slug}`)
const { data: menuData } = await useFetch(`/api/shop/${slug}/menu`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    message: error.value.message ?? 'Shop not found'
  })
}

if (!shop.value) {
  throw createError({ statusCode: 404, message: 'Shop not found' })
}

// If they landed on short_id (e.g. /42XLW), redirect to slug + utm_source=qr
if (SHORT_ID_REGEX.test(slug) && shop.value.slug !== slug) {
  await navigateTo(
    { path: `/${shop.value.slug}`, query: { utm_source: 'qr', ...(route.query as Record<string, string>) } },
    { redirectCode: 302 }
  )
}

const shareUrl = computed((): string => {
  if (import.meta.server) {
    try {
      return String(useRequestURL().href)
    } catch {
      return ''
    }
  }
  return (typeof window !== 'undefined' && window.location?.href) ? window.location.href : ''
})

useHead({
  title: shop.value.name,
  meta: [{ name: 'description', content: `${shop.value.name} – Order at your table` }]
})
</script>

<template>
  <ShopHomeContent
    v-if="shop"
    :shop="shop"
    :menu-data="menuData ?? { categories: [], items: [] }"
    :share-url="shareUrl ?? ''"
  />
</template>
