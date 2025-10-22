<template>
  <div class="row items-center q-px-md q-mt-auto">
    <div class="col">
      <q-input v-model="text" autogrow placeholder="Type a command..." filled dense />
    </div>
    <div class="col-shrink">
      <q-btn @click="showText" class="q-ml-sm q-mr-lg" round dense flat icon="send" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useTabsStore } from 'src/stores/tabs'

const $q = useQuasar()
const text = ref('')
const tabStore = useTabsStore()

const showText = () => {
  if (!text.value) {
    $q.notify({ type: 'warning', message: `Nič si nenapísal do ${tabStore.activeTab}` })
    return
  }
  $q.notify({ type: 'positive', message: `Napísal si: ${text.value} do: ${tabStore.activeTab}` })
}
</script>
