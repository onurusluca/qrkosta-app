<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('shop.title') })
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
    <UIcon name="lucide:store" class="size-16 text-neutral-300" />
    <p class="text-neutral-500">
      {{ t('shop.scanPrompt') }}
    </p>
  </div>
</template>
