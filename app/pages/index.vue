<script lang="ts" setup>
const testSlug = '42XLW'
const { data: shop, error: fetchError, status: fetchStatus } = await useFetch(`/api/shop/${testSlug}`)
</script>

<template>
  <div class="p-4">
    <h1>qrkosta app</h1>
    <div class="mt-4 p-4 bg-default-100 rounded">
      <h2 class="font-semibold mb-2">
        Test fetch: /api/shop/{{ testSlug }}
      </h2>
      <p class="text-sm text-muted mb-2">
        Status: {{ fetchStatus }}
      </p>
      <pre
        v-if="fetchError"
        class="text-xs bg-red-100 dark:bg-red-900 p-2 rounded overflow-auto"
      >{{ JSON.stringify(fetchError, null, 2) }}</pre>
      <pre
        v-else-if="shop"
        class="text-xs bg-green-100 dark:bg-green-900 p-2 rounded overflow-auto"
      >{{ JSON.stringify(shop, null, 2) }}</pre>
      <p
        v-else
        class="text-sm text-muted"
      >
        Loading...
      </p>
    </div>
  </div>
</template>
