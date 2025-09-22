<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="cursor-pointer" @click="goHome">
          TribeChat
        </q-toolbar-title>


        <!-- Logout button iba na profile -->
        <q-btn v-if="isProfilePage" flat color="negative" label="Logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const isProfilePage = computed(() => route.path === '/profile')
const goHome = async () => {
  await router.push('/')
}


async function logout() {
  try {
    await api.post('/logout')
  } catch (err) {
    console.error(err)
  } finally {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    await router.push('/')
  }
}
</script>
