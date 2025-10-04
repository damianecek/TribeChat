<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
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

        <!-- Dark / Light mode -->
        <q-btn
          dense
          flat
          round
          :icon="isDark ? 'dark_mode' : 'light_mode'"
          @click="toggleDark"
          :color="isDark ? 'secondary' : 'grey-8'"
          class="q-mr-sm"
        />

        <!-- Toggle Members Drawer -->
        <q-btn
          dense
          round
          flat
          icon="group"
          class="q-ml-sm"
          @click="toggleRightDrawer"
        />
      </q-toolbar>
    </q-header>

    <!-- LEFT DRAWER (Channel Menu) -->
    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      class="custom-drawer"
    >
      <ChannelMenu />
    </q-drawer>

    <!-- RIGHT DRAWER (Channel Members) -->
    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      :width="260"
    >
      <MemberMenu  />
    </q-drawer>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// filepath: /src/layouts/MainLayout.vue
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { Dark } from 'quasar'
import ChannelMenu from 'components/ChannelMenu.vue'
import MemberMenu from 'components/MemberMenu.vue'


// Drawers
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

// Dark mode
const isDark = computed(() => Dark.isActive)
const toggleDark = () => Dark.set(!Dark.isActive)
const titleColor = computed(() => (isDark.value ? 'text-white' : 'text-white'))

// Router
const router = useRouter()

// Navigation
const goHome = async () => router.push('/')

const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value)
const toggleRightDrawer = () => (rightDrawerOpen.value = !rightDrawerOpen.value)
</script>

<style scoped>
.custom-drawer {
  min-width: 220px;
}
</style>
