<template>
  <q-page class="main-page-root q-pa-md fit column">
    <q-card
      class="no-shadow col column full-height"
      :dark="$q.dark.isActive"
    >
      <ChannelTabs
      />

      <CommandInputPanel />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import ChannelTabs from 'components/ChannelTabs.vue'
import CommandInputPanel from 'components/CommandInputPanel.vue'



</script>

<style>
.main-page-root {
  height: 100%;
}
body.body--dark .main-page-root .q-card {
  background: color-mix(in srgb, var(--q-dark-page) 50%, transparent);
}
</style>
