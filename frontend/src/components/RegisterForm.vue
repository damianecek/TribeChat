<template>
  <q-card class="auth-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-weight-bold q-mb-xs">let's create your account</div>
      <div class="text-subtitle2 text-grey-5">join the tribe and start chatting</div>
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
          v-model="registerData.firstName"
          label="name"
          outlined
          dense
          :disable="loading"
          :rules="[
            (val) => !!val || 'Pole je povinné',
            (val) => val.length >= 2 || 'Meno musí mať aspoň 2 znaky',
          ]"
        />

        <q-input
          v-model="registerData.lastName"
          label="lastname"
          outlined
          dense
          :disable="loading"
          :rules="[
            (val) => !!val || 'Pole je povinné',
            (val) => val.length >= 2 || 'Priezvisko musí mať aspoň 2 znaky',
          ]"
        />

        <q-input
          v-model="registerData.nickname"
          label="nickname"
          outlined
          dense
          :disable="loading"
          :rules="[
            (val) => !!val || 'Pole je povinné',
            (val) => val.length >= 3 || 'Prezývka musí mať aspoň 3 znaky',
            (val) => val.length <= 20 || 'Maximálne 20 znakov',
          ]"
        />

        <q-input
          v-model="registerData.email"
          label="email"
          type="email"
          outlined
          dense
          :disable="loading"
          :rules="[
            (val) => !!val || 'Pole je povinné',
            (val) => /\S+@\S+\.\S+/.test(val) || 'Zadaj platný e-mail',
          ]"
        />

        <q-input
          v-model="registerData.password"
          label="password"
          type="password"
          outlined
          dense
          :disable="loading"
          :rules="[
            (val) => !!val || 'Pole je povinné',
            (val) => val.length >= 8 || 'Heslo musí mať aspoň 8 znakov',
            (val) => /[A-Z]/.test(val) || 'Aspoň jedno veľké písmeno',
            (val) => /[0-9]/.test(val) || 'Aspoň jedna číslica',
          ]"
        />

        <div class="row justify-center">
          <q-btn
            label="register"
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
      <span class="text-grey-5">already part of the tribe?</span>
      <q-btn flat color="secondary" to="/login" label="Sign in" class="q-ml-xs" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import type { RegisterData } from 'src/types/auth';

const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');
const auth = useAuthStore();

const registerData = ref<RegisterData>({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  password: '',
} as RegisterData);

const clearError = () => {
  errorMessage.value = '';
};

async function onSubmit() {
  try {
    loading.value = true;
    errorMessage.value = '';

    await auth.register(registerData.value);

    // redirect
    await router.push('/profile');
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Registrácia zlyhala. Skús to o chvíľu znova.';
  } finally {
    loading.value = false;
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
  border-color: rgba(56, 189, 248, 0.75);
}
</style>
