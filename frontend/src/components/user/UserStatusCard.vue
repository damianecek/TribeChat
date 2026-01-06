<template>
  <q-card class="channel-menu-element q-card--bordered q-card--flat no-shadow column" :dark="$q.dark.isActive">
    <q-item clickable class="channel-menu-element" @click="$emit('profile-click')">
      <q-item-section avatar>
        <q-avatar 
          class="status-avatar" 
          icon="account_circle" 
          color="primary" 
          text-color="white"
          :style="{ '--status-color': statusColor }" 
        />
      </q-item-section>

      <q-item-section>
        <span>{{ displayName }}</span>
        <div class="text-caption text-grey">{{ status }}</div>
      </q-item-section>

      <q-item-section side>
        <q-btn dense flat round icon="expand_more" @click.stop>
          <q-menu auto-close class="no-shadow">
            <q-list>
              <q-item 
                v-for="s in statusOptions" 
                :key="s" 
                clickable 
                v-close-popup 
                @click="$emit('update:status', s)"
              >
                <q-item-section avatar>
                  <q-icon name="circle" :style="{ color: getStatusColor(s) }" size="14px" />
                </q-item-section>
                <q-item-section>{{ s }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import type { UserStatus } from 'src/types/user'
import { getStatusColor } from 'src/utils'

interface Props {
  displayName?: string
  status: UserStatus
}

const props = withDefaults(defineProps<Props>(), {
  displayName: 'User',
})

defineEmits<{
  'update:status': [status: UserStatus]
  'profile-click': []
}>()

const $q = useQuasar()
const statusOptions: UserStatus[] = ['Online', 'Away', 'Offline', 'DND']

const statusColor = computed(() => getStatusColor(props.status))
</script>

<style scoped>
.channel-menu-element {
  color: var(--menu-text-color);
  transition: color 0.4s ease;
}

.channel-menu-element *:hover {
  color: var(--menu-hover-color);
}

body.body--light .channel-menu-element {
  --menu-text-color: #555;
  --menu-hover-color: var(--q-primary);
}

body.body--dark .channel-menu-element {
  --menu-text-color: #aaa;
  --menu-hover-color: var(--q-secondary);
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

.channel-menu-element .q-item:hover .status-avatar::after {
  inset: -1px;
  box-shadow: 0 0 12px var(--status-color);
}
</style>
