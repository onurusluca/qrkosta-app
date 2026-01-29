<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const errorDetails = computed(() => {
  const e = props.error
  if (!e) return null
  return {
    message: e.message,
    statusCode: e.statusCode,
    statusMessage: e.statusMessage,
    fatal: e.fatal,
    name: e.name,
    stack: e.stack,
    data: e.data,
    cause: e.cause,
    _raw: e
  }
})

function clearAndGoHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen max-w-4xl mx-auto px-4 py-4 font-mono text-xs leading-tight">
    <div class="flex items-center justify-between gap-4 mb-2">
      <span class="font-semibold text-default">Error {{ error?.statusCode ?? '—' }} {{ error?.statusMessage ?? error?.message ?? '' }}</span>
      <UButton
        size="xs"
        @click="clearAndGoHome"
      >
        Clear & go home
      </UButton>
    </div>
    <pre
      v-if="errorDetails"
      class="overflow-auto rounded -100 p-3 text-default-700 whitespace-pre-wrap break-all max-h-[85vh]"
    >message:     {{ errorDetails.message ?? '—' }}
statusCode:   {{ errorDetails.statusCode ?? '—' }}
statusMessage: {{ errorDetails.statusMessage ?? '—' }}
fatal:        {{ errorDetails.fatal ?? '—' }}
name:         {{ errorDetails.name ?? '—' }}

stack:
{{ errorDetails.stack ?? '—' }}

data:         {{ errorDetails.data != null ? JSON.stringify(errorDetails.data) : '—' }}

cause:        {{ errorDetails.cause instanceof Error ? (errorDetails.cause.message + '\n' + errorDetails.cause.stack) : (errorDetails.cause != null ? JSON.stringify(errorDetails.cause) : '—') }}

_raw:         {{ JSON.stringify({ message: errorDetails._raw?.message, statusCode: errorDetails._raw?.statusCode, statusMessage: errorDetails._raw?.statusMessage, fatal: errorDetails._raw?.fatal, name: errorDetails._raw?.name, data: errorDetails._raw?.data }) }}</pre>
    <pre
      v-else
      class="text-default-600"
    >No error object.</pre>
  </div>
</template>
