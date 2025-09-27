<template>
  <q-page>
    <q-splitter v-model="splitter" :limits="[12, 50]" class="col-auto">
      <template v-slot:before>
        <ChannelMenu :channels="channels" @open-channel="openChannel" />
      </template>

      <template v-slot:after>
        <div class="col" style="background-color: #f5f5f5; height: 93vh;">
          <ChannelTabs
            :tabs="tabs"
            :active-tab="activeTab"
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
import ChannelMenu from 'components/ChannelMenu.vue'
import ChannelTabs from 'components/ChannelTabs.vue'

interface Tab { id: string; label: string; content: string }
interface Channel { id: string; name: string }

const channels = ref<Channel[]>([
  { id: 'c1', name: 'General' },
  { id: 'c2', name: 'Random' },
  { id: 'c3', name: 'Announcements' }
])

const tabs = ref<Tab[]>([])
const activeTab = ref('')
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
    activeTab.value = tabs.value.length ? tabs.value[Math.max(0, idx - 1)].id : ''
  }
}
</script>
