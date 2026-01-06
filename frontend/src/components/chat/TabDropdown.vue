<template>
  <q-select 
    filled 
    dense 
    :options="tabOptions"
    :model-value="activeTabId" 
    @update:model-value="$emit('change', $event)" 
    label="Select Tab" 
    map-options
    option-value="value" 
    option-label="label"
  >
    <template v-slot:option="scope">
      <q-slide-item 
        ref="slideItem" 
        @left="(ev) => handleSlide(ev, scope.opt.value)"
        @right="(ev) => handleSlide(ev, scope.opt.value)" 
        left-color="red" 
        right-color="red"
      >
        <template v-slot:left><q-icon left name="close" /></template>
        <template v-slot:right><q-icon left name="close" /></template>

        <q-item clickable v-ripple @click="scope.toggleOption(scope.opt)">
          <q-item-section>
            <q-item-label>{{ truncatedLabel(scope.opt.label) }}</q-item-label>
          </q-item-section>

          <q-item-section no-shadow side>
            <q-btn 
              flat 
              dense 
              round 
              size="sm" 
              icon="close" 
              @click.stop="$emit('close', scope.opt.value)" 
            />
          </q-item-section>
        </q-item>
      </q-slide-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const emit = defineEmits<{
  change: [tabId: string]
  close: [tabId: string]
}>()

interface SlideEvent {
  reset: () => void
}

const tabOptions = computed(() => 
  props.tabs.map((tab) => ({ label: tab.label, value: tab.id }))
)

function truncatedLabel(label: string): string {
  return truncate(label, props.maxLabelLength)
}

function handleSlide({ reset }: SlideEvent, tabId: string) {
  reset()
  emit('close', tabId)
}
</script>
