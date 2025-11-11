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
    <q-btn dense flat round :icon="isDark ? 'dark_mode' : 'light_mode'" :color="isDark ? 'secondary' : 'grey-8'"
      class="q-mr-sm col-shrink" @click="toggleDark" />

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
import { Dark } from 'quasar'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MessageList from 'components/MessageList.vue'
import { useUiStore } from 'src/stores/ui'
import { useTabsStore } from 'src/stores/tabs'

const ui = useUiStore()
const tabsStore = useTabsStore()

const windowWidth = ref(window.innerWidth)
const isDark = computed(() => Dark.isActive)
const toggleDark = () => Dark.set(!Dark.isActive)
const slideItem = ref(null)

interface SlideEvent {
  reset: () => void
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
