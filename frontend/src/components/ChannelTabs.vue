<template>
  <q-toolbar class="bg-dark text-white">

    <q-btn dense flat round icon="menu" @click="ui.toggleLeftDrawer" />
    <div class=" col">

      <q-tabs
        :model-value="activeTab"
        @update:model-value="$emit('update:activeTab', $event)"
        shrink
        stretch
        inline-label
        align="left"
        class="col-shrink"
      >
        <q-tab
          v-for="tab in tabs"
          :key="tab.id"
          :name="tab.id"
          :label="tab.label"
        >
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


    <!-- Dark / Light mode -->
    <q-btn
      dense
      flat
      round
      :icon="isDark ? 'dark_mode' : 'light_mode'"
      @click="toggleDark"
      :color="isDark ? 'secondary' : 'grey-8'"
      class="q-mr-sm"
    />

    <!-- Toggle Members Drawer -->
    <q-btn
      dense
      round
      flat
      icon="group"
      class="q-ml-sm"
      @click="ui.toggleRightDrawer"
        />
  </q-toolbar>
  <!-- Tab Bar -->



  <!-- Tab Content Panels -->
  <q-tab-panels
    :model-value="activeTab"
    @update:model-value="$emit('update:activeTab', $event)"
    animated
    class="tab-root col"
  >
    <q-tab-panel
      v-for="tab in tabs"
      :key="tab.id"
      :name="tab.id"
      class="column absolute-full"
    >
      <!-- New component -->

      <MessageList />

    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import {Dark} from 'quasar'
import type { Tab } from 'src/types'
import { useUiStore } from 'src/stores/ui'
import MessageList from 'components/MessageList.vue'

const ui = useUiStore()

const isDark = computed(() => Dark.isActive)
const toggleDark = () => Dark.set(!Dark.isActive)

defineProps<{
  tabs: Tab[]
  activeTab: string | number
}>()

defineEmits<{
  (e: 'update:activeTab', val: string | number): void
  (e: 'close-tab', id: string): void
  (e: 'add-tab'): void
}>()


</script>

<style scoped>

body.body--dark .tab-root{
  background-color: var(--q-dark-page);
}

</style>

