<script setup>
const route = useRoute()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', key: 'favicon' }
  ],
  htmlAttrs: {
    lang: 'en',
    'data-preview-embed': computed(() => (route.query.qrkprev56mv1024vl === '1' ? 'true' : undefined))
  },
  bodyAttrs: {
    'data-preview-embed': computed(() => (route.query.qrkprev56mv1024vl === '1' ? 'true' : undefined))
  }
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
