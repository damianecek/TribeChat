<template>
  <q-scroll-area class="fit column">
    <q-infinite-scroll @load="onLoad" reverse>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
        </div>
      </template>

      <div class="q-pa-md column">
        <q-chat-message v-for="(msg, index) in messages" :key="index" :name="msg.name" :text="[msg.text]"
          :sent="msg.sent" :stamp="msg.time" :avatar="msg.avatar" :bg-color="messageColor(msg.sent)"/>
      </div>
    </q-infinite-scroll>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ChatMessage {
  name: string
  text: string
  time: string
  sent: boolean
  avatar: string
}

const messages = ref<ChatMessage[]>([
  {
    name: 'Nastya',
    text: 'Privet, zaychyk 😘',
    time: '10:01',
    sent: false,
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg'
  },
  {
    name: 'Ty',
    text: 'No čau, čau, moja ukrajinská kráľovná 😏',
    time: '10:02',
    sent: true,
    avatar: 'https://cdn.quasar.dev/img/avatar4.jpg'
  },
  {
    name: 'Nastya',
    text: 'Ty čo, ešte programuješ ten chat?',
    time: '10:03',
    sent: false,
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg'
  },
  {
    name: 'Ty',
    text: 'Hej, už tam hádžem Quasar messaging systém 💪',
    time: '10:04',
    sent: true,
    avatar: 'https://cdn.quasar.dev/img/avatar4.jpg'
  }
])

const onLoad = (index: number, done: () => void) => {
  // Simulujeme načítanie starších správ
  setTimeout(() => {
    messages.value.unshift({
      name: 'System',
      text: 'Older messages loaded...',
      time: '09:59',
      sent: false,
      avatar: 'https://cdn.quasar.dev/img/avatar.png'
    })
    done()
  }, 1500)
}

function messageColor(sent: boolean): string {
  return sent ? 'grey-3' : 'amber-3'
}

function addMessage(m: ChatMessage) {
  messages.value.push(m)
}
defineExpose({ addMessage })

</script>

<style scoped>
.q-scroll-area {
  height: 100%;
  background-color: transparent;
}
</style>
