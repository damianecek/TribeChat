<template>
  <div class="q-pa-md">
    <h6>Channels</h6>
    <q-list>
      <q-item
        v-for="channel in channels"
        :key="channel.id"
        clickable
        @click="$emit('open-channel', channel)"
      >
        <q-item-section>{{ channel.name }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
//import { PropType } from 'vue'

interface Channel {
  id: string
  name: string
}

defineProps<{
  channels: Channel[]
}>()
</script>
