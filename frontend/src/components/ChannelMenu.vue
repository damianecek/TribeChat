<template>
  <div class="q-md column justify-between">
    <!-- Profile Box at Top -->
    <div class="q-pa-md col">
      <template v-if="isLoggedIn">
        <q-item clickable @click="goProfile" class="q-card q-card--dark q-dark q-card--bordered q-card--flat no-shadow">
          <q-item-section avatar>
            <q-avatar icon="account_circle" color="primary" text-color="white" />
          </q-item-section>
          <q-item-section>
            <span>{{ user?.nickname || 'User' }}</span>
          </q-item-section>
        </q-item>
      </template>
    </div>
  </div>


    <!-- Toolbar -->
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Channels</q-toolbar-title>
    </q-toolbar>

    <!-- Channel List -->
    <q-list class="channel-list col-auto">
      <q-item
        v-for="channel in channels"
        :key="channel.id"
        clickable
        @click="openChannel(channel)"
      >
        <q-item-section>{{ channel.name }}</q-item-section>
      </q-item>
    </q-list>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, onMounted as vueOnMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useTabsStore } from 'stores/tabs'
import { useChannelsStore } from 'stores/channels'
import type { Channel } from 'src/types'

const auth = useAuthStore()
const router = useRouter()
const tabsStore = useTabsStore()
const channelsStore = useChannelsStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const user = computed(() => auth.user)
const channels = computed(() => channelsStore.channels)

const goProfile = async () => {
  await router.push('/profile')
}

function openChannel(channel: Channel) {
  const existing = tabsStore.tabs.find(t => t.label === channel.name)
  if (existing) {
    tabsStore.activeTab = existing.id
  } else {
    const newId = String(Date.now())
    tabsStore.addTab({ id: newId, label: channel.name, content: `Welcome to #${channel.name}!` })
  }
}

// Example: Load channels on mount (replace with API call if needed)
vueOnMounted(() => {
  if (channelsStore.channels.length === 0) {
    channelsStore.setChannels([
      { id: '1', name: 'general' },
      { id: '2', name: 'random' },
      { id: '3', name: 'help' }
    ])
  }
})
</script>
