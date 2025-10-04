<template>
  <q-layout class="auth-layout">
    <q-page-container class="bg-gradient flex flex-center">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// No header navigation for auth pages - content comes from the routed pages.
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
}

.bg-gradient {
  background: linear-gradient(135deg, #0f172a, #1e293b 55%, #334155);
  padding: 32px 16px;
}
</style>
