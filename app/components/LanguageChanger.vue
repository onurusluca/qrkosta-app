<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const options = computed(() =>
  (locales.value ?? []).map((l: { code: string, name?: string }) => ({
    value: l.code,
    label: (l as { name?: string }).name ?? l.code
  }))
)

function onSelect(v: string | { value: string } | undefined) {
  const code = typeof v === 'object' && v?.value != null ? v.value : (v as string) ?? 'en'
  setLocale(code)
}
</script>

<template>
  <USelect
    :model-value="locale"
    :items="options"
    value-key="value"
    size="sm"
    variant="ghost"
    class="min-w-24"
    @update:model-value="onSelect"
  />
</template>
