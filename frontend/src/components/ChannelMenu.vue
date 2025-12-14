<template>
  <div class="channel-menu-root column fit">
    <!-- Channel List -->
    <q-list class="channel-list col q-pa-md">
      <q-card class="q-card--bordered q-card--flat column no-shadow fit" :dark="$q.dark.isActive">
        <div class="q-pa-sm col-auto row justify-between items-center">
          <div class="text-subtitle5">Channels</div>
          <q-btn icon="add" color="primary" flat dense round size="sm" @click="showAddDialog = true" />
        </div>

        <q-separator style="width: 95%; margin: 0 auto;" />

<q-scroll-area class="col fit">
  <q-infinite-scroll class="channel-menu-element" @load="handleScrollLoad">
    <div v-if="invitedChannels.length" class="q-mt-sm">
      <div class="text-caption text-grey q-pl-sm q-mb-xs">Invited</div>

      <q-item v-for="channel in invitedChannels" :key="channel.id" clickable
        class="channel-menu-element items-center channel-invited" @click="confirmJoin(channel)">
        <q-item-section>
          <div class="row items-center no-wrap">
            <span>{{ truncate(channel.channelName) }}</span>
            <q-chip dense outline color="secondary" text-color="secondary" class="q-ml-sm">Invited</q-chip>
            <q-icon v-if="!channel.isPublic" name="lock" size="16px" class="q-ml-sm text-grey" />
          </div>
        </q-item-section>

        <q-item-section side>
          <div class="row no-wrap items-center">
            <q-btn dense flat round icon="check" color="positive" @click.stop="confirmJoin(channel)" />
            <q-btn dense flat round icon="close" color="negative" @click.stop="declineChannel(channel)" />
          </div>
        </q-item-section>
      </q-item>
    </div>

    <div v-if="myChannels.length" class="q-mt-sm">
      <div class="text-caption text-grey q-pl-sm q-mb-xs">My Channels</div>

      <q-item v-for="channel in myChannels" :key="channel.id" clickable
        class="channel-menu-element items-center"
        :class="{ 'channel-highlight': hasUnread(channel.id) }"
        @click="openChannel(channel)">
        <q-item-section>
          <div class="row items-center no-wrap">
            <span>{{ truncate(channel.channelName) }}</span>
            <q-icon v-if="!channel.isPublic" name="lock" size="16px" class="q-ml-sm text-grey" />
            <q-icon v-if="channel.adminId === user?.id" name="person" size="16px"
              class="q-ml-xs text-primary" />
          </div>
        </q-item-section>

        <q-item-section side>
          <q-btn dense flat round icon="more_vert" @click.stop>
            <q-menu auto-close class="no-shadow">
              <q-list style="min-width: 120px">
                <q-item v-if="channel.adminId === user?.id" clickable v-close-popup
                  @click="openEditDialog(channel)">
                  <q-item-section>Edit</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="leaveChannel(channel)">
                  <q-item-section class="text-warning">Leave</q-item-section>
                </q-item>

                <q-item v-if="channel.adminId === user?.id" clickable v-close-popup
                  @click="deleteChannel(channel)">
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
            <span>{{ truncate(channel.channelName) }}</span>
            <q-icon v-if="!channel.isPublic" name="lock" size="16px" class="q-ml-sm text-grey" />
            <q-badge v-if="isBannedFromChannel(channel.id)" color="negative" class="q-ml-sm">Banned</q-badge>
          </div>
        </q-item-section>

        <q-item-section side>
          <q-btn dense flat round icon="more_vert" @click.stop>
            <q-menu auto-close class="no-shadow">
              <q-list style="min-width: 120px">
                <q-item v-if="channel.adminId === user?.id" clickable v-close-popup
                  @click="openEditDialog(channel)">
                  <q-item-section>Edit</q-item-section>
                </q-item>

                <q-item v-if="channel.isPublic" clickable v-close-popup
                  :disable="isBannedFromChannel(channel.id)"
                  :title="isBannedFromChannel(channel.id) ? 'You are banned from this channel' : ''"
                  @click="joinChannel(channel)">
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

    <!-- 🧍 Profile Box -->
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

            <q-item-section side>
              <q-btn dense flat round icon="expand_more" @click.stop>
                <q-menu auto-close class="no-shadow">
                  <q-list>
                    <q-item v-for="s in statusOptions" :key="s" clickable v-close-popup @click="status = s">
                      <q-item-section avatar>
                        <q-icon name="circle" :style="{ color: getStatusColor(s) }" size="14px" />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { Channel } from 'src/types'
import { useAuthStore } from 'stores/auth'
import { useChannelsStore } from 'stores/channels'
import { useTabsStore } from 'stores/tabs'
import { useUserChannelsStore } from 'stores/user_channels'
import type { UserStatus } from 'src/types/user'
import { socket } from 'boot/socket'
import { useUserStore } from 'stores/user'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const tabsStore = useTabsStore()
const channelsStore = useChannelsStore()
const userChannelsStore = useUserChannelsStore()
const userStore = useUserStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const user = computed(() => userStore.currentUser)
const channels = computed(() => channelsStore.channels)

const invitedChannelIds = computed(() => {
  if (!user.value) return []
  return userChannelsStore.getInvitationsForUser(user.value.id).map((inv) => inv.channelId)
})

const myChannels = computed(() => {
  if (!user.value) return []
  const userChannelIds = userChannelsStore.userChannels
    .filter((uc) => uc.userId === user.value?.id)
    .map((uc) => uc.channelId)
  return channels.value.filter((ch) => userChannelIds.includes(ch.id))
})

watch(myChannels, (newChannels) => {
  const allowedIds = newChannels.map(ch => ch.id)

  // Find tabs that shouldn't exist anymore
  const invalidTabs = tabsStore.tabs.filter(tab => !allowedIds.includes(tab.id))

  invalidTabs.forEach(tab => {
    tabsStore.closeTab(tab.id) // or whatever your store's close fn is
  })
})


const otherChannels = computed(() => {
  if (!user.value) return channels.value
  const userChannelIds = userChannelsStore.userChannels
    .filter((uc) => uc.userId === user.value?.id)
    .map((uc) => uc.channelId)
  return channels.value.filter(
    (ch) => !userChannelIds.includes(ch.id) && !invitedChannelIds.value.includes(ch.id)
  )
})

const invitedChannels = computed(() => channels.value.filter((ch) => invitedChannelIds.value.includes(ch.id)))

const bannedChannelIds = computed(() => {
  if (!user.value) return []
  return userChannelsStore.bans.filter((ban) => ban.userId === user.value?.id).map((ban) => ban.channelId)
})

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const newChannelName = ref('')
const editChannelName = ref('')
const newIsPublic = ref(false)
const editIsPublic = ref(false)
const channelBeingEdited = ref<Channel | null>(null)

const statusOptions: UserStatus[] = ['Online', 'Away', 'Offline', 'DND']

function setStatus(newStatus: UserStatus) {
  if (!user.value) return
  userStore.updateUserStatus(user.value.id, newStatus)
  socket?.emit('user:setStatus', { status: newStatus })
  void userStore.updateStatus(newStatus)
}

const status = computed<UserStatus>({
  get: () => user.value?.status || 'Offline',
  set: (newStatus) => setStatus(newStatus),
})

function getStatusColor(status: UserStatus): string {
  switch (status) {
    case 'Online': return 'limegreen'
    case 'Away': return 'gold'
    case 'DND': return 'orangered'
    case 'Offline': return 'gray'
    default: return 'lightgray'
  }
}

const goProfile = async () => router.push('/profile')

const isInvited = (channelId: string) => invitedChannelIds.value.includes(channelId)
const isBannedFromChannel = (channelId: string) => bannedChannelIds.value.includes(channelId)

function openChannel(channel: Channel) {
  const existing = tabsStore.tabs.find((t) => t.id === channel.id)
  if (existing) tabsStore.setActiveTab(existing.id)
  else {
    tabsStore.addTab({
      id: channel.id,
      label: channel.channelName,
      content: `Welcome to #${channel.channelName}!`,
    })
    tabsStore.setActiveTab(channel.id)
  }
}

function addChannel() {
  if (!user.value) return
  const name = newChannelName.value.trim()
  if (!name) return
  channelsStore.createChannel(name, newIsPublic.value)
  newChannelName.value = ''
  showAddDialog.value = false
}

function saveEdit() {
  if (!channelBeingEdited.value) return
  const updatedName = editChannelName.value.trim()
  if (!updatedName) return
  channelsStore.updateChannel(channelBeingEdited.value.id, updatedName, editIsPublic.value)
  showEditDialog.value = false
}

function deleteChannel(channel: Channel) {
  if (!channel?.id) return
  channelsStore.deleteChannel(channel.id)
}

function openEditDialog(channel: Channel) {
  channelBeingEdited.value = channel
  editChannelName.value = channel.channelName
  editIsPublic.value = channel.isPublic
  showEditDialog.value = true
}

function joinChannel(channel: Channel) {
  if (!user.value) return

  if (isBannedFromChannel(channel.id)) {
    $q.notify({ type: 'negative', message: 'You are banned from this channel.' })
    return
  }

  if (isInvited(channel.id)) {
    void confirmJoin(channel)
    return
  }

  if (!channel.isPublic) {
    $q.notify({ type: 'warning', message: 'This is a private channel. Invitation required.' })
    return
  }

  userChannelsStore.joinChannel(channel.id)
}

function confirmJoin(channel: Channel) {
  userChannelsStore.acceptInvite(channel.id)
  $q.notify({ type: 'positive', message: `Joining #${channel.channelName}` })
}

function declineChannel(channel: Channel) {
  userChannelsStore.declineInvite(channel.id)
}

function leaveChannel(channel: Channel) {
  userChannelsStore.leaveChannel(channel.id)
}

function handleScrollLoad(_index: number, done: () => void) {
  done()
}

function truncate(str: string, max: number = 15): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

onMounted(() => {
  if (!userStore.currentUser && auth.user) {
    userStore.setCurrentUser(auth.user)
  }
})

const hasUnread = (channelId: string) => {
  if (!user.value ) return false;

  const entry = userChannelsStore.userChannels.find(
    (uc) => uc.channelId === channelId && uc.userId === user.value?.id
  );

  return entry?.hasUnread === true;
};
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

.channel-invited {
  border-left: 3px solid var(--highlight-color);
  background-color: rgba(0, 0, 0, 0.04);
}

body.body--light .channel-invited {
  --highlight-color: var(--q-primary);
}

body.body--dark .channel-invited {
  --highlight-color: var(--q-secondary);
  background-color: rgba(255, 255, 255, 0.05);
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
