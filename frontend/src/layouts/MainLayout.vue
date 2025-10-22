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

</style>
