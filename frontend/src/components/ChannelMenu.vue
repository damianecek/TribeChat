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
            <q-item v-for="channel in channels" :key="channel.id" clickable class="channel-menu-element items-center"
              :class="{ 'channel-highlight': highlightedChannels.includes(channel.id) }" @click="openChannel(channel)">
              <!-- Channel name -->
              <q-item-section>
                <div class="row items-center no-wrap">
                  <span>{{ channel.name }}</span>
                  <q-icon v-if="channel.is_public" name="lock" size="16px" class="q-ml-sm text-grey" />
                </div>
              </q-item-section>

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
              <q-avatar class="status-avatar" icon="account_circle" color="primary" text-color="white"
                :style="{ '--status-color': getStatusColor(status) }" />
            </q-item-section>

            <q-item-section>
              <span>{{ user?.nickname || 'User' }}</span>
              <div class="text-caption text-grey">{{ status }}</div>
            </q-item-section>

            <!-- Arrow Button for Status -->
            <q-item-section side>
              <q-btn dense flat round icon="expand_more" @click.stop>
                <q-menu auto-close class="no-shadow">
                  <q-list>
                    <q-item v-for="s in statusOptions" :key="s" clickable v-close-popup @click="status = s">
                      <q-item-section avatar>
                        <q-icon name="circle" :style="{ 'color': getStatusColor(s) }" size="14px" />
                      </q-item-section>
                      <q-item-section>{{ s }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
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
          <q-toggle v-model="newIsPublic" label="Private" />
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
          <q-toggle v-model="editIsPublic" label="Private" />
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
import type { MemberStatus } from 'src/types'

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
const newIsPublic = ref(false)
const editIsPublic = ref(false)
const channelBeingEdited = ref<Channel | null>(null)
const status = ref<MemberStatus>('Online')

const statusOptions: MemberStatus[] = ['Online', 'Away', 'Offline', "DND"]

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
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online': return 'limegreen'
    case 'away': return 'gold'
    case 'dnd': return 'orangered'
    case 'offline': return 'gray'
    default: return 'lightgray'
  }
}

function addChannel() {
  const name = newChannelName.value.trim()
  const is_public = newIsPublic.value
  if (!name) return

  const newId = String(Date.now())
  channelsStore.addChannel({ id: newId, name, is_public })

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
  const updatedIsPublic = editIsPublic.value
  if (!updatedName) return

  channelsStore.updateChannel(channelBeingEdited.value.id, updatedName, updatedIsPublic)
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
      { id: '1', name: '🌐 general', is_public: true },
      { id: '2', name: '💬 chit-chat', is_public: true },
      { id: '3', name: '🆘 help-desk', is_public: true },
      { id: '4', name: '📢 announcements', is_public: true },
      { id: '5', name: '🎮 gaming', is_public: true },
      { id: '6', name: '💻 dev-talk', is_public: true },
      { id: '7', name: '🎨 art-share', is_public: true },
      { id: '8', name: '🎶 music', is_public: true },
      { id: '9', name: '📚 knowledge-base', is_public: true },
      { id: '10', name: '🍿 movies-tv', is_public: true },
      { id: '11', name: '📷 photography', is_public: true },
      { id: '12', name: '🍔 foodies', is_public: true },
      { id: '13', name: '🌍 world-news', is_public: true },
      { id: '14', name: '⚽ sports', is_public: true },
      { id: '15', name: '📈 crypto-stocks', is_public: true },
      { id: '16', name: '🎭 memes', is_public: true },
      { id: '17', name: '🤖 ai-bots', is_public: true },
      { id: '18', name: '📖 book-club', is_public: true },
      { id: '19', name: '✈️ travel', is_public: true },
      { id: '20', name: '🚀 tech-trends', is_public: true },
      { id: '21', name: '🎤 voice-hangout', is_public: true },
      { id: '22', name: '🔒 private-chat', is_public: true },
      { id: '23', name: '⚙️ project-lab', is_public: false },
      { id: '24', name: '📝 feedback', is_public: false },
      { id: '25', name: '🎉 events', is_public: false },
      { id: '26', name: '🐾 pets', is_public: false },
      { id: '27', name: '🛠️ coding-help', is_public: false },
      { id: '28', name: '💡 ideas', is_public: false },
      { id: '29', name: '🌌 sci-fi', is_public: false },
      { id: '30', name: '🔥 trending', is_public: false }
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
  overflow: visible;
  /* ensure the outline isn’t clipped */
}

/* Outer outline ring */
.status-avatar::after {
  content: "";
  position: absolute;
  inset: -2px;
  /* size of gap + ring thickness */
  border-radius: 50%;
  border: 2px solid var(--status-color, transparent);
  box-sizing: border-box;
  box-shadow: 0 0 6px var(--status-color);
  pointer-events: none;
  /* so clicks still hit the avatar */

  transition:
    inset 0.25s ease,
    box-shadow 0.4s ease;
}

.channel-menu-element .q-item:hover .status-avatar::after {
  inset: -1px;
  box-shadow: 0 0 12px var(--status-color);
}
</style>
