<template>
  <div class="channel-menu-root column fit">
    <!-- Channel List -->
    <q-list class="channel-list col q-pa-md">
      <q-card class="q-card--bordered q-card--flat column no-shadow fit" :dark="$q.dark.isActive">
        <!-- Toolbar -->
        <div class="q-pa-sm col-auto row justify-between items-center">
          <div class="text-subtitle5">Channels</div>
          <q-btn icon="add" color="primary" flat dense round size="sm" @click="showAddDialog = true" />
        </div>


        <q-separator style="width: 95%; margin: 0 auto;" />

        <q-scroll-area class="col fit">
          <q-infinite-scroll class="channel-menu-element" @load="handleScrollLoad">
            <q-item
              v-for="channel in channels"
              :key="channel.id"
              clickable
              class="channel-menu-element items-center"
              :class="{ 'channel-highlight': highlightedChannels.includes(channel.id) }"
              @click="openChannel(channel)"
            >
              <!-- Channel name -->
              <q-item-section>{{ channel.name }}</q-item-section>

              <!-- Menu (3 dots) -->
              <q-item-section side>
                <q-btn dense flat round icon="more_vert" @click.stop>
                  <q-menu auto-close class="no-shadow">
                    <q-list style="min-width: 120px">
                      <q-item clickable v-close-popup @click="openEditDialog(channel)">
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="deleteChannel(channel)">
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-infinite-scroll>
        </q-scroll-area>

      </q-card>
    </q-list>

    <!-- Profile Box at Bottom -->
    <div class="q-px-md q-pb-md q-mt-auto">
      <template v-if="isLoggedIn">
        <q-card class="channel-menu-element q-card--bordered q-card--flat no-shadow column" :dark="$q.dark.isActive">
          <q-item clickable class="channel-menu-element" @click="goProfile">
            <q-item-section avatar>
              <q-avatar 
              class="status-avatar" 
              icon="account_circle" 
              color="primary" 
              text-color="white" 
              :style="{ '--status-color': getStatusColor() }"
              />
            </q-item-section>
            <q-item-section>
              <span>{{ user?.nickname || 'User' }}</span>
            </q-item-section>
          </q-item>
        </q-card>
      </template>
    </div>

    <!-- Add Channel Dialog -->
    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Create New Channel</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newChannelName" label="Channel name" autofocus />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Create" color="primary" @click="addChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Channel Dialog -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Edit Channel</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="editChannelName" label="New name" autofocus />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import type { Channel } from 'src/types'
import { useAuthStore } from 'stores/auth'
import { useChannelsStore } from 'stores/channels'
import { useTabsStore } from 'stores/tabs'

const auth = useAuthStore()
const router = useRouter()
const tabsStore = useTabsStore()
const channelsStore = useChannelsStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const user = computed(() => auth.user)
const channels = computed(() => channelsStore.channels)

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const newChannelName = ref('')
const editChannelName = ref('')
const channelBeingEdited = ref<Channel | null>(null)

const goProfile = async () => {
  await router.push('/profile')
}

function openChannel(channel: Channel) {
  const existing = tabsStore.tabs.find(t => t.label === channel.name)
  if (existing) {
    tabsStore.setActiveTab(existing.id)
  } else {
    const newId = String(Date.now())
    tabsStore.addTab({ id: newId, label: channel.name, content: `Welcome to #${channel.name}!` })
  }
}
function getStatusColor(): string {
  return 'limegreen' // Assuming user is always online for this example
}

function addChannel() {
  const name = newChannelName.value.trim()
  if (!name) return

  const newId = String(Date.now())
  channelsStore.addChannel({ id: newId, name })

  newChannelName.value = ''
  showAddDialog.value = false
}

function openEditDialog(channel: Channel) {
  channelBeingEdited.value = channel
  editChannelName.value = channel.name
  showEditDialog.value = true
}

function saveEdit() {
  if (!channelBeingEdited.value) return
  const updatedName = editChannelName.value.trim()
  if (!updatedName) return

  channelsStore.updateChannel(channelBeingEdited.value.id, updatedName)
  showEditDialog.value = false
}

function deleteChannel(channel: Channel) {
  channelsStore.deleteChannel(channel.id)
}

function handleScrollLoad(_index: number, done: () => void) {
  done()
}

const highlightedChannels = ref<string[]>([])

// Example: Load channels on mount (replace with API call if needed)
onMounted(() => {
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

  const all = channelsStore.channels.map(c => c.id)
  const count = Math.min(5, all.length)
  highlightedChannels.value = all
    .sort(() => 0.5 - Math.random()) // shuffle
    .slice(0, count)
})
</script>

<style scoped>
.channel-menu-root {
  height: 100%;
}

.channel-menu-element {
  /* default color for everything inside */
  color: var(--menu-text-color);
  transition: color 0.4s ease;
}

/* make hover items white */
.channel-menu-element *:hover {
  color: var(--menu-hover-color);
}

/* Light mode overrides */
body.body--light .channel-menu-element {
  --menu-text-color: #555;
  /* grey text in light mode */
  --menu-hover-color: var(--q-primary);
  /* black on hover */
}

/* Dark mode overrides */
body.body--dark .channel-menu-element {
  --menu-text-color: #aaa;
  /* soft grey text in dark mode */
  --menu-hover-color: var(--q-secondary);
  /* white on hover */
}

.channel-highlight {
  background-color: rgba(var(--highlight-color), 0.08);
}

.channel-highlight::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--highlight-color);
  box-shadow: 0 0 6px var(--highlight-color);
}

/* optional: glowing text or background */
body.body--dark .channel-highlight {
  color: var(--q-secondary);
  text-shadow: 0 0 6px var(--q-secondary);
  --highlight-color: var(--q-secondary);
}

/* optional: glowing text or background */
body.body--light .channel-highlight {
  color: var(--q-primary);
  text-shadow: 0 0 6px var(--q-primary);
  --highlight-color: var(--q-primary);
}

.status-avatar {
  position: relative;
  border-radius: 50%;
  overflow: visible; /* ensure the outline isn’t clipped */
}

/* Outer outline ring */
.status-avatar::after {
  content: "";
  position: absolute;
  inset: -2px; /* size of gap + ring thickness */
  border-radius: 50%;
  border: 2px solid var(--status-color, transparent);
  box-sizing: border-box;
  box-shadow: 0 0 6px var(--status-color);
  pointer-events: none; /* so clicks still hit the avatar */

  transition:
    inset 0.25s ease,
    box-shadow 0.4s ease;
}

.channel-menu-element .q-item:hover .status-avatar::after {
  inset: -1px;
  box-shadow: 0 0 12px var(--status-color);
}
</style>
