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

            <div v-if="myChannels.length" class="q-mt-sm">
              <div class="text-caption text-grey q-pl-sm q-mb-xs">My Channels</div>

              <q-item v-for="channel in myChannels" :key="channel.id" clickable
                class="channel-menu-element items-center"
                :class="{ 'channel-highlight': highlightedChannels.includes(channel.id) }"
                @click="openChannel(channel)">
                <q-item-section>
                  <div class="row items-center no-wrap">
                    <span>{{ channel.name }}</span>
                    <q-icon v-if="!channel.is_public" name="lock" size="16px" class="q-ml-sm text-grey" />
                    <q-icon v-if="channel.user_id" name="person" size="16px" class="q-ml-xs text-primary" />
                  </div>
                </q-item-section>

                <q-item-section side>
                  <q-btn dense flat round icon="more_vert" @click.stop>
                    <q-menu auto-close class="no-shadow">
                      <q-list style="min-width: 120px">
                        <q-item v-if="channel.user_id" clickable v-close-popup @click="openEditDialog(channel)">
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="leaveChannel(channel)">
                          <q-item-section class="text-warning">Leave</q-item-section>
                        </q-item>

                        <q-item v-if="channel.user_id" clickable v-close-popup @click="deleteChannel(channel)">
                          <q-item-section class="text-negative">Delete</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </div>

            <div v-if="otherChannels.length" class="q-mt-md">
              <div class="text-caption text-grey q-pl-sm q-mb-xs">Other Channels</div>

              <q-item v-for="channel in otherChannels" :key="channel.id" class="channel-menu-element items-center">
                <q-item-section>
                  <div class="row items-center no-wrap">
                    <span>{{ channel.name }}</span>
                    <q-icon v-if="!channel.is_public" name="lock" size="16px" class="q-ml-sm text-grey" />
                  </div>
                </q-item-section>

                <q-item-section side>
                  <q-btn dense flat round icon="more_vert" @click.stop>
                    <q-menu auto-close class="no-shadow">
                      <q-list style="min-width: 120px">
                        <q-item v-if="channel.user_id" clickable v-close-popup @click="openEditDialog(channel)">
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item v-if="channel.is_public" clickable v-close-popup @click="joinChannel(channel)">
                          <q-item-section class="text-positive">Join</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </div>

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
import { useUserChannelsStore } from 'stores/user_channels'
import type { UserStatus } from 'src/types/user'

const router = useRouter()
const auth = useAuthStore()
const tabsStore = useTabsStore()
const channelsStore = useChannelsStore()
const userChannelsStore = useUserChannelsStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const user = computed(() => auth.user)
const channels = computed(() => channelsStore.channels)

const myChannels = computed(() => {
  if (!user.value) return []
  const userChannelIds = userChannelsStore
    .userChannels
    .filter(uc => uc.user_id === user.value!.id)
    .map(uc => uc.channel_id)
  return channels.value.filter(ch => userChannelIds.includes(ch.id))
})

const otherChannels = computed(() => {
  if (!user.value) return channels.value
  const userChannelIds = userChannelsStore
    .userChannels
    .filter(uc => uc.user_id === user.value!.id)
    .map(uc => uc.channel_id)
  return channels.value.filter(ch => !userChannelIds.includes(ch.id))
})

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const newChannelName = ref('')
const editChannelName = ref('')
const newIsPublic = ref(false)
const editIsPublic = ref(false)
const channelBeingEdited = ref<Channel | null>(null)
const status = ref<UserStatus>('Online')

const statusOptions: UserStatus[] = ['Online', 'Away', 'Offline', 'DND']

const goProfile = async () => {
  await router.push('/profile')
}

function openChannel(channel: Channel) {
  const existing = tabsStore.tabs.find(t => t.id === channel.id)
  if (existing) {
    tabsStore.setActiveTab(existing.id)
  } else {
    tabsStore.addTab({
      id: channel.id,
      label: channel.name,
      content: `Welcome to #${channel.name}!`
    })
    tabsStore.setActiveTab(channel.id)
  }
}

// ============ API INTEGRATION ============

// načítanie kanálov po prihlásení
onMounted(async () => {
  if (!auth.isLoggedIn) return
  try {
    const res = await fetch('http://localhost:3333/channels', {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      channelsStore.setChannels(data)
    } else {
      console.error('Error loading channels:', await res.text())
    }
  } catch (err) {
    console.error('Fetch failed:', err)
  }
})

// vytvorenie nového kanála
async function addChannel() {
  if (!user.value) return
  const name = newChannelName.value.trim()
  if (!name) return

  try {
    const res = await fetch('http://localhost:3333/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        channelName: name,
        isPublic: !newIsPublic.value,
      }),
    })

    if (res.ok) {
      const created = await res.json()
      const channel: Channel = {
        id: created.id,
        name: created.channelName,
        is_public: created.isPublic,
        user_id: created.adminId,
      }
      channelsStore.addChannel(channel)
      newChannelName.value = ''
      showAddDialog.value = false
    } else {
      console.error('Error creating channel:', await res.text())
    }
  } catch (err) {
    console.error('Create failed:', err)
  }
}

// úprava kanála (len lokálne)
function openEditDialog(channel: Channel) {
  channelBeingEdited.value = channel
  editChannelName.value = channel.name
  editIsPublic.value = !channel.is_public
  showEditDialog.value = true
}

function saveEdit() {
  if (!channelBeingEdited.value) return
  const updatedName = editChannelName.value.trim()
  if (!updatedName) return

  channelsStore.updateChannel(channelBeingEdited.value.id, updatedName, !editIsPublic.value)
  showEditDialog.value = false
}

// vymazanie kanála
async function deleteChannel(channel: Channel) {
  if (!channel?.id) return
  try {
    const res = await fetch(`http://localhost:3333/channels/${channel.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    if (res.ok) {
      channelsStore.deleteChannel(channel.id)
    } else {
      console.error('Failed to delete channel:', await res.text())
    }
  } catch (err) {
    console.error('Delete failed:', err)
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

function joinChannel(channel: Channel) {
  if (!user.value) return
  userChannelsStore.addUserToChannel(user.value.id, channel.id)
}

function leaveChannel(channel: Channel) {
  if (!user.value) return
  userChannelsStore.removeUserFromChannel(user.value.id, channel.id)
}

function handleScrollLoad(_index: number, done: () => void) {
  done()
}

const highlightedChannels = ref<string[]>([])
onMounted(() => {
  const all = channelsStore.channels.map(c => c.id)
  const count = Math.min(5, all.length)
  highlightedChannels.value = all
    .sort(() => 0.5 - Math.random())
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
