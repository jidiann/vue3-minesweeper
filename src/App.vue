<script setup lang="ts">
useHead({
  title: 'Vue3 Minesweeper',
})
</script>

<template>
  <main font-sans p="y-10" text="center gray-700 dark:gray-200">
    <RouterView />
    <Footer />
  </main>
</template>
