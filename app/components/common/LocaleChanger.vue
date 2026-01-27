<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

const languages = computed(() => [
  { code: 'ja', label: t('common.languages.japanese') },
  { code: 'en', label: t('common.languages.english') }
])
</script>

<template>
  <USelect
    v-model="locale"
    :items="languages"
    value-key="code"
    icon="lucide:globe"
    size="sm"
    variant="ghost"
    @update:model-value="(value: string) => setLocale(value as 'ja' | 'en')"
  />
</template>
