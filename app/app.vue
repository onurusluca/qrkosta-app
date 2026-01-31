<script setup>
const route = useRoute()

// Static head only – no computed refs, so initial document isn’t blocked
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', key: 'favicon' }
  ],
  htmlAttrs: { lang: 'en' }
})

// Preview embed attribute set client-side so useHead stays static
const isPreviewEmbed = computed(() => route.query.qrkprev56mv1024vl === '1')
function applyPreviewEmbed() {
  if (isPreviewEmbed.value) {
    document.documentElement.setAttribute('data-preview-embed', 'true')
    document.body.setAttribute('data-preview-embed', 'true')
  } else {
    document.documentElement.removeAttribute('data-preview-embed')
    document.body.removeAttribute('data-preview-embed')
  }
}
onMounted(applyPreviewEmbed)
watch(isPreviewEmbed, applyPreviewEmbed)
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
