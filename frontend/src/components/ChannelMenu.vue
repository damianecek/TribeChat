<template>
  <div class="q-pt-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Channels</q-toolbar-title>
    </q-toolbar>
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

import type { Channel } from 'src/types';

defineProps<{
  channels: Channel[]
}>()
</script>
