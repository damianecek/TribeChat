<template>
  <div class="channel-menu-root column fit">
    <!-- Channel List -->
    <q-list class="channel-list col q-pa-md">
      <q-card class="q-card--bordered q-card--flat column no-shadow fit" :dark="$q.dark.isActive">
        <div class="q-pa-sm col-auto row justify-between items-center">
          <div class="text-subtitle5">Channels</div>
          <q-btn icon="add" color="primary" flat dense round size="sm" @click="openAddDialog" />
        </div>

        <q-separator style="width: 95%; margin: 0 auto;" />

        <q-scroll-area class="col fit">
          <q-infinite-scroll class="channel-menu-element" @load="handleScrollLoad">
            <!-- Invited Channels -->
            <div v-if="invitedChannels.length" class="q-mt-sm">
              <div class="text-caption text-grey q-pl-sm q-mb-xs">Invited</div>
              <ChannelListItem
                v-for="channel in invitedChannels"
                :key="channel.id"
                :channel="channel"
                :is-invited="true"
                @click="confirmJoin(channel)"
                @accept="confirmJoin(channel)"
                @decline="declineChannel(channel)"
              />
            </div>

            <!-- My Channels -->
            <div v-if="myChannels.length" class="q-mt-sm">
              <div class="text-caption text-grey q-pl-sm q-mb-xs">My Channels</div>
              <ChannelListItem
                v-for="channel in myChannels"
                :key="channel.id"
                :channel="channel"
                :is-admin="channel.adminId === user?.id"
                :has-unread="hasUnread(channel.id)"
                @click="openChannel(channel)"
              >
                <template #menu>
                  <q-list style="min-width: 120px">
                    <q-item 
                      v-if="channel.adminId === user?.id" 
                      clickable 
                      v-close-popup
                      @click="openEditDialog(channel)"
                    >
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="leaveChannel(channel)">
                      <q-item-section class="text-warning">Leave</q-item-section>
                    </q-item>
                    <q-item 
                      v-if="channel.adminId === user?.id" 
                      clickable 
                      v-close-popup
                      @click="deleteChannel(channel)"
                    >
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </ChannelListItem>
            </div>

            <!-- Other Channels -->
            <div v-if="otherChannels.length" class="q-mt-md">
              <div class="text-caption text-grey q-pl-sm q-mb-xs">Other Channels</div>
              <ChannelListItem
                v-for="channel in otherChannels"
                :key="channel.id"
                :channel="channel"
                :is-banned="isBannedFromChannel(channel.id)"
                @click="() => {}"
              >
                <template #menu>
                  <q-list style="min-width: 120px">
                    <q-item 
                      v-if="channel.adminId === user?.id" 
                      clickable 
                      v-close-popup
                      @click="openEditDialog(channel)"
                    >
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item 
                      v-if="channel.isPublic" 
                      clickable 
                      v-close-popup
                      :disable="isBannedFromChannel(channel.id)"
                      :title="isBannedFromChannel(channel.id) ? 'You are banned from this channel' : ''"
                      @click="joinChannel(channel)"
                    >
                      <q-item-section class="text-positive">Join</q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </ChannelListItem>
            </div>
          </q-infinite-scroll>
        </q-scroll-area>
      </q-card>
    </q-list>

    <!-- Profile Box -->
    <div class="q-px-md q-pb-md q-mt-auto">
      <UserStatusCard
        v-if="isLoggedIn"
        :display-name="user?.nickname"
        :status="status"
        @update:status="setStatus"
        @profile-click="goProfile"
      />
    </div>

    <!-- Dialogs -->
    <ChannelDialogs
      v-model="dialogState"
      @add="addChannel"
      @edit="saveEdit"
    />
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
import { useUserStore } from 'stores/user'
import ChannelListItem from 'components/channel/ChannelListItem.vue'
import UserStatusCard from 'components/user/UserStatusCard.vue'
import ChannelDialogs from 'components/channel/ChannelDialogs.vue'

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
  const invalidTabs = tabsStore.tabs.filter(tab => !allowedIds.includes(tab.id))
  invalidTabs.forEach(tab => {
    tabsStore.closeTab(tab.id)
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

// Dialog state management
const channelBeingEdited = ref<Channel | null>(null)
const dialogState = ref({
  showAdd: false,
  showEdit: false,
  editChannel: null as Channel | null,
})

function setStatus(newStatus: UserStatus) {
  if (!user.value) return
  void userStore.updateStatus(newStatus)
}

const status = computed<UserStatus>({
  get: () => user.value?.status || 'Offline',
  set: (newStatus) => setStatus(newStatus),
})

const goProfile = async () => router.push('/profile')

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

function openAddDialog() {
  dialogState.value.showAdd = true
}

function addChannel(name: string, isPublic: boolean) {
  if (!user.value || !name) return
  channelsStore.createChannel(name, isPublic)
}

function openEditDialog(channel: Channel) {
  channelBeingEdited.value = channel
  dialogState.value.editChannel = channel
  dialogState.value.showEdit = true
}

function saveEdit(channelId: string, name: string, isPublic: boolean) {
  if (!name) return
  channelsStore.updateChannel(channelId, name, isPublic)
}

function deleteChannel(channel: Channel) {
  if (!channel?.id) return
  channelsStore.deleteChannel(channel.id)
}

function joinChannel(channel: Channel) {
  if (!user.value) return

  if (isBannedFromChannel(channel.id)) {
    $q.notify({ type: 'negative', message: 'You are banned from this channel.' })
    return
  }

  if (invitedChannelIds.value.includes(channel.id)) {
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

onMounted(() => {
  if (!userStore.currentUser && auth.user) {
    userStore.setCurrentUser(auth.user)
  }
})

const hasUnread = (channelId: string) => {
  if (!user.value) return false

  const entry = userChannelsStore.userChannels.find(
    (uc) => uc.channelId === channelId && uc.userId === user.value?.id
  )

  return entry?.hasUnread === true
}
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
