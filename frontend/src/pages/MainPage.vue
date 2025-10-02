<template>
  <q-page class="main-page-root q-pa-md fit column">
    <q-card
      class="q-card--bordered q-card--flat no-shadow col column full-height"
      :dark="$q.dark.isActive"
    >
      <ChannelTabs
        :tabs="tabsStore.tabs"
        :activeTab="tabsStore.activeTab"
        @update:activeTab="handleUpdateActiveTab"
        @close-tab="handleCloseTab"
        @add-tab="handleAddTab"
      />

      <ComandInputPanel />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// filepath: /home/namelessnovice/Desktop/VPWA/TribeChat/frontend/src/pages/MainPage.vue
import { useTabsStore } from 'stores/tabs'
import ChannelTabs from 'components/ChannelTabs.vue'
import ComandInputPanel from 'src/components/ComandInputPanel.vue'

const tabsStore = useTabsStore()

function handleUpdateActiveTab(val: string | number) {
  tabsStore.activeTab = val
}

function handleCloseTab(id: string) {
  tabsStore.closeTab(id)
}

function handleAddTab() {
  const newId = String(Date.now())
  tabsStore.addTab({
    id: newId,
    label: `Tab ${tabsStore.tabs.length + 1}`,
    content: `Content for Tab ${tabsStore.tabs.length + 1}`
  })
}
</script>

<style>
.main-page-root {
  height : 100%;
}
</style>
