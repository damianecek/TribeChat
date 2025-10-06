import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const leftDrawerOpen = ref(false)
  const rightDrawerOpen = ref(false)

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  function toggleRightDrawer() {
    rightDrawerOpen.value = !rightDrawerOpen.value
  }

  function openLeftDrawer() {
    leftDrawerOpen.value = true
  }

  function closeLeftDrawer() {
    leftDrawerOpen.value = false
  }

  function openRightDrawer() {
    rightDrawerOpen.value = true
  }

  function closeRightDrawer() {
    rightDrawerOpen.value = false
  }

  return {
    leftDrawerOpen,
    rightDrawerOpen,
    toggleLeftDrawer,
    toggleRightDrawer,
    openLeftDrawer,
    closeLeftDrawer,
    openRightDrawer,
    closeRightDrawer,
  }
})
