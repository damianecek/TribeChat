import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tab } from 'src/types'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTab = ref<string>('')

  function addTab(tab: Tab) {
    tabs.value.push(tab)
    activeTab.value = tab.id
  }

  function closeTab(id: string) {
    const idx = tabs.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tabs.value.splice(idx, 1)
      if (activeTab.value === id) {
        if (tabs.value.length > 0) {
          const fallbackIdx = Math.max(0, idx - 1)
          const fallbackTab = tabs.value[fallbackIdx]
          activeTab.value = fallbackTab ? fallbackTab.id : ''
        } else {
          activeTab.value = ''
        }
      }
    }
  }

  function setActiveTab(id: string) {
    activeTab.value = id
  }

  return { tabs, activeTab, addTab, closeTab, setActiveTab }
})


export type TabsStore = ReturnType<typeof useTabsStore>