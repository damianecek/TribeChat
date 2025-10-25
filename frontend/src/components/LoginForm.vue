<template>
  <q-card class="auth-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-weight-bold q-mb-xs">welcome!</div>
      <div class="text-subtitle2 text-grey-5">sign in to jump right back</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-banner v-if="errorMessage" class="q-mb-md bg-negative text-white" inline-actions>
        {{ errorMessage }}
        <template #action>
          <q-btn dense flat icon="close" @click="clearError" />
        </template>
      </q-banner>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          v-model="uid"
          label="email/nickname"
          outlined
          dense
          :disable="loading"
          :rules="[val => !!val || 'necesarry field!']"
        />

        <q-input
          v-model="password"
          label="passwrd"
          type="password"
          outlined
          dense
          :disable="loading"
          :rules="[val => !!val || 'necesarry field!']"
        />

        <div class="row justify-center">
          <q-btn
            label="log in"
            type="submit"
            color="primary"
            unelevated
            size="m"
            class="q-mt-sm full-width"
            :loading="loading"
          />
        </div>
      </q-form>

    </q-card-section>

    <q-separator inset class="q-my-md" />

    <q-card-section class="text-center q-pt-none">
      <span class="text-grey-5">not part of the tribe?</span>
      <q-btn flat color="secondary" to="/register" label="register" class="q-ml-xs" />
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
const loading = ref(false)
const errorMessage = ref('')

const clearError = () => {
  errorMessage.value = ''
}

async function onSubmit() {
  try {
    loading.value = true
    errorMessage.value = ''

    const res = await api.post<LoginResponse>('/login', {
      uid: uid.value,
      password: password.value,
    })

    const { token } = res.data

    // uložiť token
    localStorage.setItem('token', token.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token.token}`

    // redirect
    await router.push('/main')
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Prihlásenie zlyhalo. Skontroluj údaje a skús znova.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 420px;
  max-width: 100%;
  border-radius: 18px;
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.92);
  color: #e2e8f0;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
}

.auth-card :deep(.q-field__label) {
  color: rgba(226, 232, 240, 0.6);
}

.auth-card :deep(.q-field--outlined .q-field__control) {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.4);
}

.auth-card :deep(.q-field--outlined .q-field__control:hover) {
  border-color: rgba(236, 72, 153, 0.75);
}
</style>
