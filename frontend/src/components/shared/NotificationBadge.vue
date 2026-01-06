<template>
  <q-btn
    dense
    flat
    round
    icon="notifications"
    class="q-mr-sm col-shrink"
  >
    <q-badge color="primary" floating>{{ notificationLabel }}</q-badge>
    <q-menu auto-close>
      <q-list style="min-width: 160px">
        <q-item 
          v-for="option in options" 
          :key="option" 
          clickable 
          v-close-popup 
          @click="$emit('change', option)"
        >
          <q-item-section>{{ formatLabel(option) }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotificationSetting } from 'src/types'

interface Props {
  modelValue: NotificationSetting
}

const props = defineProps<Props>()

defineEmits<{
  change: [value: NotificationSetting]
}>()

const options: NotificationSetting[] = ['silent', 'mentions', 'all']

const notificationLabel = computed(() => props.modelValue.toUpperCase())

function formatLabel(setting: NotificationSetting): string {
  switch (setting) {
    case 'silent':
      return 'Silent'
    case 'mentions':
      return 'Mentions Only'
    case 'all':
      return 'All'
    default:
      return setting
  }
}
</script>
