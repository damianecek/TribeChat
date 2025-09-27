<template>
  <div class="q-pa-md">
    <q-infinite-scroll @load="onLoad" reverse>
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
  </div>
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
