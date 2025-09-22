<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">Tvoj profil</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="user">
        <div><b>ID:</b> {{ user.id }}</div>
        <div><b>Meno:</b> {{ user.firstName }} {{ user.lastName }}</div>
        <div><b>Nickname:</b> {{ user.nickname }}</div>
        <div><b>Email:</b> {{ user.email }}</div>
      </q-card-section>

      <q-card-section v-else>
        <div class="text-negative">Nepodarilo sa načítať údaje</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import type { User, MeResponse } from '../types/auth'


const router = useRouter()
const user = ref<User | null>(null)

onMounted(async () => {
  try {
    const res = await api.get<MeResponse>('/me')
    user.value = res.data.user
  } catch (err) {
    console.error(err)
    await router.push('/login')
  }
})
</script>
