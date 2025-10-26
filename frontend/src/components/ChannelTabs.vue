<template>
  <q-toolbar class="bg-dark text-white">
    <q-btn dense flat round icon="menu" @click="ui.toggleLeftDrawer" />

    <div class="col">
      <q-tabs
        :model-value="activeTab"
        @update:model-value="$emit('update:activeTab', $event)"
        shrink
        stretch
        inline-label
        align="left"
        class="col-shrink"
      >
        <q-tab v-for="tab in tabs" :key="tab.id" :name="tab.id" :label="tab.label">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="close"
            @click.stop="$emit('close-tab', tab.id)"
          />
        </q-tab>
      </q-tabs>
    </div>

    <q-btn
      dense
      flat
      round
      :icon="isDark ? 'dark_mode' : 'light_mode'"
      :color="isDark ? 'secondary' : 'grey-8'"
      class="q-mr-sm"
      @click="toggleDark"
    />

    <q-btn dense flat round icon="group" class="q-ml-sm" @click="ui.toggleRightDrawer" />
  </q-toolbar>

  <q-tab-panels
    :model-value="activeTab"
    @update:model-value="$emit('update:activeTab', String($event))"
    animated
    class="tab-root col"
  >
    <q-tab-panel v-for="tab in tabs" :key="tab.id" :name="tab.id" class="column absolute-full">
      <MessageList />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { Dark } from 'quasar'
import { computed } from 'vue'
import MessageList from 'components/MessageList.vue'
import { useUiStore } from 'src/stores/ui'
import type { Tab } from 'src/types'

const ui = useUiStore()

const isDark = computed(() => Dark.isActive)
const toggleDark = () => Dark.set(!Dark.isActive)

defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

defineEmits<{
  (e: 'update:activeTab', val: string): void
  (e: 'close-tab', id: string): void
  (e: 'add-tab'): void
}>()
</script>

<style scoped>
body.body--dark .tab-root {
  background-color: var(--q-dark-page);
}
</style>
