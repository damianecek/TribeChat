<template>
  <q-toolbar>
    <q-btn dense flat round icon="menu" @click="ui.toggleLeftDrawer" />

    <div class="col q-mx-sm">
      <!-- Tabs for larger screens -->
      <q-tabs v-if="windowWidth > 600" :model-value="tabsStore.activeTab?.id" @update:model-value="onTabChange" shrink
        stretch inline-label align="left" class="col-shrink">
        <q-tab v-for="tab in tabsStore.tabs" :key="tab.id" :name="tab.id" :label="tab.label">
          <q-btn flat dense round size="sm" icon="close" @click.stop="tabsStore.closeTab(tab.id)" />
        </q-tab>
      </q-tabs>

      <!-- Dropdown for small screens -->
      <q-select v-else filled dense :options="tabsStore.tabs.map((tab) => ({ label: tab.label, value: tab.id }))"
        :model-value="tabsStore.activeTab?.id" @update:model-value="onTabChange" label="Select Tab" map-options
        option-value="value" option-label="label">
        <template v-slot:option="scope">
          <q-slide-item ref="slideItem" @left="(ev) => onSlide(ev, scope.opt.value)"
            @right="(ev) => onSlide(ev, scope.opt.value)" left-color="red" right-color="red">
            <template v-slot:left><q-icon left name="close" /></template>
            <template v-slot:right><q-icon left name="close" /></template>

            <q-item clickable v-ripple @click="scope.toggleOption(scope.opt)">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>

              <q-item-section no-shadow side>
                <q-btn flat dense round size="sm" icon="close" @click.stop="tabsStore.closeTab(scope.opt.value)" />
              </q-item-section>
            </q-item>
          </q-slide-item>
        </template>
      </q-select>
    </div>

    <!-- Right side buttons -->
    <q-btn
      v-if="tabsStore.activeTab?.id"
      dense
      flat
      round
      icon="notifications"
      class="q-mr-sm col-shrink"
    >
      <q-badge color="primary" floating>{{ notificationSetting.toUpperCase() }}</q-badge>
      <q-menu auto-close>
        <q-list style="min-width: 160px">
          <q-item clickable v-close-popup @click="setNotification('silent')">
            <q-item-section>Silent</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setNotification('mentions')">
            <q-item-section>Mentions Only</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setNotification('all')">
            <q-item-section>All</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-btn dense flat round icon="group" class="q-ml-sm col-shrink" @click="ui.toggleRightDrawer" />
  </q-toolbar>

  <!-- Tab panels -->
  <q-tab-panels :model-value="tabsStore.activeTab?.id" animated class="tab-root col">
    <q-tab-panel v-for="tab in tabsStore.tabs" :key="tab.id" :name="tab.id" class="column absolute-full">
      <MessageList />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { computed } from 'vue'
import MessageList from 'components/MessageList.vue'
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

  // If no tab or no user, default to 'all'
  if (!activeTabId || !currentUserId) return 'all'

  // Lookup the user's notification setting for this channel
  return userChannelsStore.getNotificationSetting(activeTabId, currentUserId) ?? 'all'
})
const slideItem = ref(null)

interface SlideEvent {
  reset: () => void
}

function setNotification(mode: NotificationSetting) {
  const activeTabId = tabsStore.activeTab?.id
  const currentUserId = usersStore.currentUser?.id

  // If no tab or no user, default to 'all'
  if (!activeTabId || !currentUserId) return

  userChannelsStore.changeNotificationSetting(activeTabId, currentUserId, mode)
}

function onTabChange(newId: string) {
  tabsStore.setActiveTab(newId)
}

function handleResize() {
  windowWidth.value = window.innerWidth
}

function onSlide({ reset }: SlideEvent, tabId: string) {
  reset()
  tabsStore.closeTab(tabId)
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
body.body--dark .tab-root {
  background-color: var(--q-dark-page);
}
</style>
