<template>
  <div class="channel-menu-root column fit">
    <!-- Toolbar -->

    <!-- Channel List -->
    <q-list class="channel-list col-auto q-pa-md">
      <q-card
        class="q-card--bordered q-card--flat no-shadow col fit"
        :dark="$q.dark.isActive"
      >
        <q-toolbar>
          <q-toolbar-title>Channels</q-toolbar-title>
        </q-toolbar>

        <q-scroll-area class="message-list-scroll">
          <q-infinite-scroll reverse scroll-target=".message-list-scroll__scroll">
            <q-item
            v-for="channel in channels"
            :key="channel.id"
            clickable
            @click="openChannel(channel)"
            >
              <q-item-section class="col">{{ channel.name }}</q-item-section>
            </q-item>
            </q-infinite-scroll>
      </q-scroll-area>
      </q-card>
    </q-list>

    <!-- Profile Box at Bottom -->
    <div class="q-pa-md q-mt-auto">
      <template v-if="isLoggedIn">
        <q-card
          class="q-card--bordered q-card--flat no-shadow column"
          :dark="$q.dark.isActive"
        >
          <q-item clickable @click="goProfile">
            <q-item-section avatar>
              <q-avatar icon="account_circle" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <span>{{ user?.nickname || 'User' }}</span>
            </q-item-section>
          </q-item>
        </q-card>
      </template>
    </div>
  </div>
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
      { id: '1', name: '🌐 general' },
      { id: '2', name: '💬 chit-chat' },
      { id: '3', name: '🆘 help-desk' },
      { id: '4', name: '📢 announcements' },
      { id: '5', name: '🎮 gaming' },
      { id: '6', name: '💻 dev-talk' },
      { id: '7', name: '🎨 art-share' },
      { id: '8', name: '🎶 music' },
      { id: '9', name: '📚 knowledge-base' },
      { id: '10', name: '🍿 movies-tv' },
      { id: '11', name: '📷 photography' },
      { id: '12', name: '🍔 foodies' },
      { id: '13', name: '🌍 world-news' },
      { id: '14', name: '⚽ sports' },
      { id: '15', name: '📈 crypto-stocks' },
      { id: '16', name: '🎭 memes' },
      { id: '17', name: '🤖 ai-bots' },
      { id: '18', name: '📖 book-club' },
      { id: '19', name: '✈️ travel' },
      { id: '20', name: '🚀 tech-trends' },
      { id: '21', name: '🎤 voice-hangout' },
      { id: '22', name: '🔒 private-chat' },
      { id: '23', name: '⚙️ project-lab' },
      { id: '24', name: '📝 feedback' },
      { id: '25', name: '🎉 events' },
      { id: '26', name: '🐾 pets' },
      { id: '27', name: '🛠️ coding-help' },
      { id: '28', name: '💡 ideas' },
      { id: '29', name: '🌌 sci-fi' },
      { id: '30', name: '🔥 trending' }
    ])
  }
})
</script>

<style scoped>
.channel-menu-root {
  height: 100%;
}
.message-list-scroll {
  height: 81vh;
  min-height: 0;
}
</style>
