<template>
  <q-toolbar>
    <q-btn dense flat round icon="menu" @click="ui.toggleLeftDrawer" />

    <div class="col q-mx-sm">
      <!-- Tabs for larger screens -->
      <TabBar
        v-if="windowWidth > 600"
        :tabs="tabsStore.tabs"
        :active-tab-id="tabsStore.activeTab?.id || undefined"
        @change="onTabChange"
        @close="tabsStore.closeTab"
      />

      <!-- Dropdown for small screens -->
      <TabDropdown
        v-else
        :tabs="tabsStore.tabs"
        :active-tab-id="tabsStore.activeTab?.id || undefined"
        @change="onTabChange"
        @close="tabsStore.closeTab"
      />
    </div>

    <!-- Right side buttons -->
    <NotificationBadge
      v-if="tabsStore.activeTab?.id"
      :model-value="notificationSetting"
      @change="setNotification"
    />

    <q-btn dense flat round icon="group" class="q-ml-sm col-shrink" @click="ui.toggleRightDrawer" />
  </q-toolbar>

  <!-- Tab panels -->
  <q-tab-panels :model-value="tabsStore.activeTab?.id" animated class="tab-root col">
    <q-tab-panel v-for="tab in tabsStore.tabs" :key="tab.id" :name="tab.id" class="column absolute-full no-padding">
      <MessageList />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import MessageList from 'components/MessageList.vue'
import TabBar from 'components/chat/TabBar.vue'
import TabDropdown from 'components/chat/TabDropdown.vue'
import NotificationBadge from 'components/shared/NotificationBadge.vue'
import { useUiStore } from 'src/stores/ui'
import { useTabsStore } from 'src/stores/tabs'
import { useUserStore} from 'src/stores/user'
import { useUserChannelsStore } from 'src/stores/user_channels'
import type { NotificationSetting } from 'src/types'

const ui = useUiStore()
const tabsStore = useTabsStore()
const userChannelsStore = useUserChannelsStore()
const usersStore = useUserStore()

const windowWidth = ref(window.innerWidth)

const notificationSetting = computed<NotificationSetting>(() => {
  const activeTabId = tabsStore.activeTab?.id
  const currentUserId = usersStore.currentUser?.id

  if (!activeTabId || !currentUserId) return 'all'

  return userChannelsStore.getNotificationSetting(activeTabId, currentUserId) ?? 'all'
})

function setNotification(mode: NotificationSetting) {
  const activeTabId = tabsStore.activeTab?.id
  const currentUserId = usersStore.currentUser?.id

  if (!activeTabId || !currentUserId) return

  userChannelsStore.changeNotificationSetting(activeTabId, currentUserId, mode)
}

function onTabChange(newId: string) {
  tabsStore.setActiveTab(newId)
}

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
body.body--dark .tab-root {
  background-color: transparent;
}
</style>
