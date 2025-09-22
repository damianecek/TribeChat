<template>
  <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">Login</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">

        <q-input v-model="uid" label="Email alebo Nickname" outlined dense
          :rules="[val => !!val || 'Pole je povinné']" />

        <q-input v-model="password" label="Heslo" type="password" outlined dense
          :rules="[val => !!val || 'Pole je povinné']" />

        <div class="row justify-center">
          <q-btn label="Login" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

interface LoginResponse {
  user: {
    id: number
    firstName: string
    lastName: string
    nickname: string
    email: string
  }
  token: {
    type: string
    token: string
    expiresAt: string
  }
}

const uid = ref('')
const password = ref('')
const router = useRouter()

async function onSubmit() {
  try {
    const res = await api.post<LoginResponse>('/login', {
      uid: uid.value,
      password: password.value,
    })

    const { token } = res.data

    // uložiť token
    localStorage.setItem('token', token.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token.token}`

    // redirect
    await router.push('/profile')
  } catch (err) {
    console.error(err)
    alert('Prihlásenie zlyhalo')
  }
}
</script>

