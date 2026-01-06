<template>
  <q-tabs 
    :model-value="activeTabId" 
    @update:model-value="$emit('change', $event)" 
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
      :label="truncatedLabel(tab.label)"
    >
      <q-btn 
        flat 
        dense 
        round 
        size="sm" 
        icon="close" 
        @click.stop="$emit('close', tab.id)" 
      />
    </q-tab>
  </q-tabs>
</template>

<script setup lang="ts">
import type { Tab } from 'src/types'
import { truncate } from 'src/utils'

interface Props {
  tabs: Tab[]
  activeTabId?: string | undefined
  maxLabelLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLabelLength: 20,
})

defineEmits<{
  change: [tabId: string]
  close: [tabId: string]
}>()

function truncatedLabel(label: string): string {
  return truncate(label, props.maxLabelLength)
}
</script>
