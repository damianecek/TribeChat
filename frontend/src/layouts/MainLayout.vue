<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-toolbar-title class="cursor-pointer" @click="goHome">
          TribeChat
        </q-toolbar-title>

        <!-- Right side buttons -->
        <div class="row items-center q-gutter-sm">
          <!-- If not logged in -->
          <template v-if="!isLoggedIn">
            <q-btn flat color="primary" label="Login" @click="goLogin" />
            <q-btn flat color="secondary" label="Register" @click="goRegister" />
          </template>

          <!-- If logged in -->
          <template v-else>
            <q-btn
              v-if="!isProfilePage"
              flat
              color="primary"
              icon="account_circle"
              label="Profile"
              @click="goProfile"
            />

            <!-- Only show logout on profile page -->
            <q-btn
              v-if="isProfilePage"
              flat
              color="negative"
              label="Logout"
              @click="logout"
            />
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Dark } from 'quasar'
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()

Dark.set(false)

const router = useRouter()
const route = useRoute()

// ✅ Computed for profile page
const isProfilePage = computed(() => route.path === '/profile')

// ✅ Check login state
const isLoggedIn = computed(() => auth.isLoggedIn)

// ✅ Navigation helpers
const goHome = async () => {
  await router.push('/')
}

const goLogin = async () => {
  await router.push('/login')
}

const goRegister = async () => {
  await router.push('/register')
}

const goProfile = async () => {
  await router.push('/profile')
}

// ✅ Logout logic
async function logout() {
  await auth.logout()
  await router.push('/') // or '/'
}
</script>
