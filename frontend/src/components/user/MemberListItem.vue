<template>
  <q-item clickable>
    <q-item-section avatar>
      <q-avatar 
        icon="person" 
        color="primary" 
        text-color="white" 
        class="status-avatar"
        :style="{ '--status-color': statusColor }" 
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="user-name">{{ user.nickname }}</q-item-label>
      <q-item-label caption>{{ user.status }}</q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn dense flat round icon="more_vert" @click.stop>
        <q-menu auto-close class="no-shadow">
          <slot name="menu" />
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'src/types/user'
import { getStatusColor } from 'src/utils'

interface Props {
  user: User
}

const props = defineProps<Props>()

const statusColor = computed(() => getStatusColor(props.user.status))
</script>

<style scoped>
.member-list .q-item {
  color: var(--menu-text-color);
  transition: color 0.2s, background-color 0.2s;
}

.member-list .q-item:hover .q-item__label {
  color: var(--menu-hover-color);
}

.status-avatar {
  position: relative;
  border-radius: 50%;
  overflow: visible;
}

.status-avatar::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid var(--status-color, transparent);
  box-sizing: border-box;
  box-shadow: 0 0 6px var(--status-color);
  pointer-events: none;
  transition:
    inset 0.25s ease,
    box-shadow 0.4s ease;
}

.member-list .q-item:hover .status-avatar::after {
  inset: -1px;
  box-shadow: 0 0 32px var(--status-color);
}

body.body--light .member-list {
  --menu-text-color: #555;
  --menu-hover-color: #000;
}

body.body--dark .member-list {
  --menu-text-color: #aaa;
  --menu-hover-color: #fff;
}
</style>
