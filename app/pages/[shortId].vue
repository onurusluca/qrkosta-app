<script setup lang="ts">
const route = useRoute()
const shortId = route.params.shortId as string

const { data: shop, error } = await useFetch(`/api/shop/s/${shortId}`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    message: error.value.message ?? 'Shop not found'
  })
}

if (!shop.value) {
  throw createError({ statusCode: 404, message: 'Shop not found' })
}

// Redirect to slug URL ASAP for canonical URL + utm_source=qr analytics
await navigateTo(
  { path: `/${shop.value.slug}`, query: { utm_source: 'qr', ...(route.query as Record<string, string>) } },
  { redirectCode: 302 }
)
</script>

<template>
  <div />
</template>
