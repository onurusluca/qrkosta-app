<script setup lang="ts">
import type { Currency } from '~/composables/useCurrency'

const { currency, setCurrency, CURRENCIES } = useCurrency()

const options = CURRENCIES.map(code => ({
  value: code,
  label: code
}))
</script>

<template>
  <USelectMenu
    :model-value="currency"
    :items="options"
    value-key="value"
    size="sm"
    class="min-w-20"
    @update:model-value="(v: Currency | { value: Currency } | undefined) => setCurrency(typeof v === 'object' && v?.value != null ? v.value : (v as Currency) ?? 'JPY')"
  />
</template>
