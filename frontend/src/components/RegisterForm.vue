<template>
  <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">Register</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">

        <q-input v-model="firstName" label="Meno" outlined dense :rules="[val => !!val || 'Pole je povinné']" />

        <q-input v-model="lastName" label="Priezvisko" outlined dense :rules="[val => !!val || 'Pole je povinné']" />

        <q-input v-model="nickname" label="Nickname" outlined dense :rules="[val => !!val || 'Pole je povinné']" />

        <q-input v-model="email" label="Email" type="email" outlined dense
          :rules="[val => !!val || 'Pole je povinné']" />

        <q-input v-model="password" label="Heslo" type="password" outlined dense
          :rules="[val => !!val || 'Pole je povinné']" />

        <div class="row justify-center">
          <q-btn label="Register" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import type { AuthResponse } from '../types/auth'


const firstName = ref('')
const lastName = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

async function onSubmit() {
  try {
    const res = await api.post<AuthResponse>('/register', {
      firstName: firstName.value,
      lastName: lastName.value,
      nickname: nickname.value,
      email: email.value,
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
    alert('Registrácia zlyhala')
  }
}
</script>

