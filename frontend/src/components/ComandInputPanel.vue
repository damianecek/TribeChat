<template>
  <!-- Input area (fixed below scroll) -->
  <div class="q-px-md col">
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
