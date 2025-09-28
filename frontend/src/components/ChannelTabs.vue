<template>
  <div class="q-pt-md column fit">
    <!-- Tab Bar -->
    <q-tabs
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
      shrink
      stretch
      inline-label
      align="left"
      class="col-auto"
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
         <div class = "column fit">
           <MessageList />
         </div>

        <!-- Input area (fixed below scroll) -->
      </q-tab-panel>
    </q-tab-panels>
    <div class="q-pa-md" style="max-width: 600px">
      <q-input
        v-model="text"
        filled
        autogrow
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const text = ref('')

</script>
