<template>
  <div class="member-drawer-root column fit">
    <!-- Header -->
    <div class="col-auto text-subtitle5 q-pa-md">
      Users ({{ users.length }})
    </div>

    <q-scroll-area class="col fit">
      <q-list class="member-list">

        <!-- USERS IN CURRENT CHANNEL -->
        <div v-if="usersInChannel.length" class="q-mb-md">
          <div class="text-caption text-grey q-pl-sm q-mb-xs">In this channel</div>

          <q-item v-for="userItem in usersInChannel" :key="userItem.id" clickable>
            <q-item-section avatar>
              <q-avatar :icon="'person'" color="primary" text-color="white" class="status-avatar"
                :style="{ '--status-color': getStatusColor(userItem.status) }" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="user-name">{{ userItem.firstName }}</q-item-label>
              <q-item-label caption>{{ userItem.status }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn dense flat round icon="more_vert" @click.stop>
                <q-menu auto-close class="no-shadow">
                  <q-list style="min-width: 130px">
                    <!-- Profile -->
                    <q-item clickable v-close-popup @click="openProfile(userItem)">
                      <q-item-section>Profile</q-item-section>
                    </q-item>

                    <!-- Kick -->
                    <q-item v-if="isOwner" clickable v-close-popup @click="kickUser(userItem)">
                      <q-item-section class="text-warning">Kick</q-item-section>
                    </q-item>

                    <!-- Ban / Vote Ban -->
                    <q-item v-if="isOwner" clickable v-close-popup @click="banUser(userItem)">
                      <q-item-section class="text-negative">Ban</q-item-section>
                    </q-item>

                    <q-item v-else-if="!isOwner" clickable v-close-popup @click="voteBanUser(userItem)">
                      <q-item-section class="text-negative">Vote Ban</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </div>

        <!-- OTHER USERS -->
        <div v-if="otherUsers.length">
          <div class="text-caption text-grey q-pl-sm q-mb-xs">Other users</div>

          <q-item v-for="userItem in otherUsers" :key="userItem.id">
            <q-item-section avatar>
              <q-avatar :icon="'person'" color="primary" text-color="white" class="status-avatar"
                :style="{ '--status-color': getStatusColor(userItem.status) }" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="user-name">{{ userItem.firstName }}</q-item-label>
              <q-item-label caption>{{ userItem.status }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn dense flat round icon="more_vert" @click.stop>
                <q-menu auto-close class="no-shadow">
                  <q-list style="min-width: 130px">
                    <!-- Profile -->
                    <q-item clickable v-close-popup @click="openProfile(userItem)">
                      <q-item-section>Profile</q-item-section>
                    </q-item>

                    <!-- Invite -->
                    <q-item clickable v-close-popup @click="inviteUser(userItem)">
                      <q-item-section class="text-positive">Invite</q-item-section>
                    </q-item>

                    <!-- Owner can ban -->
                    <q-item v-if="isOwner" clickable v-close-popup @click="banUser(userItem)">
                      <q-item-section class="text-negative">Ban</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelsStore } from 'stores/channels'
import { useUserChannelsStore } from 'stores/user_channels'
import { useUserStore } from 'stores/user'
import { useTabsStore } from 'stores/tabs'
import type { User } from 'src/types/user'

const router = useRouter()
const tabsStore = useTabsStore()
const channelsStore = useChannelsStore()
const userChannelsStore = useUserChannelsStore()
const userStore = useUserStore()

const activeTab = computed(() => tabsStore.activeTab)

const users = userStore.users


const isOwner = computed(() => {
  const ch = channelsStore.channels.find(ch => ch.id === tabsStore.activeTab)
  return !!ch?.adminId
})



const usersInChannel = computed(() => {
  const uc = userChannelsStore.userChannels
    .filter(link => link.channelId === activeTab.value)
    .map(link => link.userId)
  return users.filter(u => uc.includes(u.id))
})

const otherUsers = computed(() => {
  const inIds = usersInChannel.value.map(u => u.id)
  return users.filter(u => !inIds.includes(u.id))
})

async function openProfile(user: User) {
  await router.push(`/profile/${user.id}`)
}

function inviteUser(user: User) {
  if (!activeTab.value) return
  userChannelsStore.addUserToChannel(user.id, activeTab.value)
}

function kickUser(user: User) {
  if (!activeTab.value) return
  userChannelsStore.removeUserFromChannel(user.id, activeTab.value)
}

function banUser(user: User) {
  console.log(`Ban ${user.firstName}`)
}

function voteBanUser(user: User) {
  console.log(`Vote ban for ${user.firstName}`)
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
</script>

<style scoped>
.body--light .member-drawer-root {
  background-color: #f5f5f5;
}

.member-list .q-item {
  color: var(--menu-text-color);
  transition: color 0.2s, background-color 0.2s;
}

.member-list .q-item:hover .q-item__label {
  color: var(--menu-hover-color);
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

.member-list .q-item:hover .status-avatar::after {
  inset: -1px;
  box-shadow: 0 0 32px var(--status-color);
}


/* Light mode overrides */
body.body--light .member-list {
  --menu-text-color: #555;
  --menu-hover-color: #000;
}

/* Dark mode overrides */
body.body--dark .member-list {
  --menu-text-color: #aaa;
  --menu-hover-color: #fff;
}
</style>
