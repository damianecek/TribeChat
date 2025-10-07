<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer show-if-above v-model="ui.leftDrawerOpen" side="left" class="custom-drawer">
      <ChannelMenu />
    </q-drawer>

    <q-drawer v-model="ui.rightDrawerOpen" side="right" :width="260">
      <MemberMenu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ChannelMenu from 'components/ChannelMenu.vue'
import MemberMenu from 'components/MemberMenu.vue'
import { useUiStore } from 'src/stores/ui'

const ui = useUiStore()
</script>
