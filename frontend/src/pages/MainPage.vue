<template>
  <q-page class="q-px-md fit">
    <ChannelTabs
      :tabs="tabsStore.tabs"
      :activeTab="tabsStore.activeTab"
      @update:activeTab="handleUpdateActiveTab"
      @close-tab="handleCloseTab"
      @add-tab="handleAddTab"
    />
  </q-page>
</template>

<script setup lang="ts">
// filepath: /home/namelessnovice/Desktop/VPWA/TribeChat/frontend/src/pages/MainPage.vue
import { useTabsStore } from 'stores/tabs'
import ChannelTabs from 'components/ChannelTabs.vue'

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
