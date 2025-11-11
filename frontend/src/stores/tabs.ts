import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Tab } from 'src/types';

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([]);
  const activeTab = ref<Tab | null>(null);

  function addTab(tab: Tab) {
    const exists = tabs.value.find((t) => t.id === tab.id);
    if (!exists) {
      tabs.value.push(tab);
    }
    activeTab.value = tab;
  }

  function closeTab(id: string) {
    const idx = tabs.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tabs.value.splice(idx, 1);
      if (activeTab.value?.id === id) {
        activeTab.value = tabs.value[idx - 1] || tabs.value[0] || null;
      }
    }
  }

  function setActiveTab(id: string) {
    const tab = tabs.value.find((t) => t.id === id) || null;
    activeTab.value = tab;
  }

  return { tabs, activeTab, addTab, closeTab, setActiveTab };
});

export type TabsStore = ReturnType<typeof useTabsStore>;
