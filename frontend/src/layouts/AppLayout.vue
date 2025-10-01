<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-dark">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />


        <q-toolbar-title
          class="cursor-pointer row justify-center"
          :class="titleColor"
          @click="goHome"
        >
          TribeChat
        </q-toolbar-title>

        <!-- Dark/Light Mode Switch -->
        <q-btn
          dense
          flat
          round
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          @click="toggleDark"
          :color="isDark ? 'secondary' : 'grey-8'"
          class="q-mr-sm"
        />

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

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      class="custom-drawer"
    >
      <ChannelMenu/>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>

</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed,ref } from 'vue'
import { Dark } from 'quasar'
import { useAuthStore } from 'stores/auth'
import ChannelMenu from 'components/ChannelMenu.vue'

const auth = useAuthStore()

// Dark mode state
const isDark = computed(() => Dark.isActive)
const toggleDark = () => {
  Dark.set(!Dark.isActive)
}

const titleColor = computed(() => isDark.value ? 'text-white' : 'text-white')

const leftDrawerOpen = ref(false)

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

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// ✅ Logout logic
async function logout() {
  await auth.logout()
  await router.push('/') // or '/'
}


</script>


