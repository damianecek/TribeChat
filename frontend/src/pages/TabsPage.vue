<template>
  <q-page>
    <q-splitter v-model="splitter" :limits="[12, 50]" class="col-auto">
      <template v-slot:before>
        <ChannelMenu :channels="channels" @open-channel="openChannel" />
      </template>

      <template v-slot:after>
        <div class="col" style=" height: 93vh;">
          <ChannelTabs
            :tabs="tabs"
            v-model:activeTab="activeTab"
            @close-tab="closeTab"
            @add-tab="addTab"
          />

        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { Tab, Channel } from 'src/types';

import ChannelMenu from 'components/ChannelMenu.vue'
import ChannelTabs from 'components/ChannelTabs.vue'

const channels = ref<Channel[]>([
  { id: 'c1', name: 'General' },
  { id: 'c2', name: 'Random' },
  { id: 'c3', name: 'Announcements' }
])

const tabs = ref<Tab[]>([])
const activeTab = ref<string | number>('') // allow string | number
const splitter = ref(15)

function openChannel(channel: Channel) {
  const existing = tabs.value.find(t => t.label === channel.name)
  if (existing) {
    activeTab.value = existing.id
  } else {
    const newId = String(Date.now())
    tabs.value.push({ id: newId, label: channel.name, content: `Welcome to #${channel.name}!` })
    activeTab.value = newId
  }
}

function addTab() {
  const newId = String(Date.now())
  tabs.value.push({ id: newId, label: `Tab ${tabs.value.length + 1}`, content: `Content for Tab ${tabs.value.length + 1}` })
  activeTab.value = newId
}

function closeTab(id: string) {
  const idx = tabs.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    tabs.value.splice(idx, 1)

    if (activeTab.value === id) {
      if (tabs.value.length > 0) {
        const fallbackIdx = Math.max(0, idx - 1)
        const fallbackTab = tabs.value[fallbackIdx]
        activeTab.value = fallbackTab ? fallbackTab.id : ''
      } else {
        activeTab.value = ''
      }
    }
  }
}

</script>
