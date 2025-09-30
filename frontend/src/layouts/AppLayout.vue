<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-dark">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />


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

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- drawer content -->
       <ChannelMenu/>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="text-center">
      <ComandInputPanel />
    </q-footer>
  </q-layout>

</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed,ref } from 'vue'
import { Dark } from 'quasar'
import { useAuthStore } from 'stores/auth'
import ChannelMenu from 'components/ChannelMenu.vue'
import ComandInputPanel from 'src/components/ComandInputPanel.vue'

const auth = useAuthStore()

Dark.set(true)
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
  await router.push('/log+in')
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
