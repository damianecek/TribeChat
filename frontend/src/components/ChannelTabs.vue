<template>
  <div class="q-card q-card--dark q-dark q-card--bordered q-card--flat no-shadow q-my-lg column" style="height: 82vh;">
    <!-- Tab Bar -->
    <q-tabs
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
      shrink
      stretch
      inline-label
      align="left"
      class="col"
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

      <!-- Add New Tab Button -->
      <q-btn
        flat
        dense
        round
        size="sm"
        icon="add"
        @click="$emit('add-tab')"
      />
    </q-tabs>

    <!-- Tab Content Panels -->
    <q-tab-panels
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
      animated
      class="col column"
    >
      <q-tab-panel
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
        class="column fit"
      >
        <!-- New component -->

        <MessageList />


      </q-tab-panel>
    </q-tab-panels>

  </div>
</template>

<script setup lang="ts">

import type { Tab } from 'src/types'

import MessageList from 'components/MessageList.vue'

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
.doc-example__content--scrollable {
  max-height: 400px;
}
</style>
