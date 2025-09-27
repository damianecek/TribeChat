<template>
  <div class="q-pa-md">
    <!-- Tab Bar -->
    <q-tabs :value="activeTab" @input="$emit('update:activeTab', $event)" shrink stretch inline-label align="left">
      <q-tab
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
        :label="tab.label"
      >
        <q-btn
          flat
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
      animated
    >
      <q-tab-panel
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
      >
        {{ tab.content }}
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">

interface Tab {
  id: string
  label: string
  content: string
}

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
