<template>
  <!-- Input area (fixed below scroll) -->
  <div class="q-pa-md" style="max-width: 1000px">
    <q-input
      v-model="text"
      filled
      autogrow
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const text = ref('')

</script>
