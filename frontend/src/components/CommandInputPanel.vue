<template>
  <div class="col-shrink q-px-md q-mt-auto">
    <q-input v-model="text" autogrow placeholder="Type a command..." />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
</script>
