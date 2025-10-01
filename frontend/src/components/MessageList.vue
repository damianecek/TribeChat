<template>
  <q-scroll-area class="message-list-scroll">
    <q-infinite-scroll @load="onLoad" reverse scroll-target=".message-list-scroll__scroll">
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div
        v-for="(item, index) in items"
        :key="index"
        class="q-mb-sm"
      >
        <q-badge class="shadow-1 q-mr-sm">
          {{ items.length - index }}
        </q-badge>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Rerum repellendus sit voluptate voluptas eveniet porro.
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ref([ {}, {}, {}, {}, {}, {}, {} ])

const onLoad = (index: number, done: () => void) => {
  setTimeout(() => {
    items.value.splice(0, 0, {}, {}, {}, {}, {}, {}, {})
    done()
  }, 2000)
}
</script>

<style scoped>
.message-list-scroll {
  height: 78vh;
  min-height: 0;
}
</style>
