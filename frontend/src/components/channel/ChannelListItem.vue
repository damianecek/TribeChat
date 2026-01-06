<template>
  <q-item 
    clickable
    class="channel-menu-element items-center"
    :class="{ 
      'channel-highlight': hasUnread,
      'channel-invited': isInvited 
    }"
    @click="$emit('click')"
  >
    <q-item-section>
      <div class="row items-center no-wrap">
        <span>{{ truncatedName }}</span>
        <q-chip 
          v-if="isInvited" 
          dense 
          outline 
          color="secondary" 
          text-color="secondary" 
          class="q-ml-sm"
        >
          Invited
        </q-chip>
        <q-icon 
          v-if="!channel.isPublic" 
          name="lock" 
          size="16px" 
          class="q-ml-sm text-grey" 
        />
        <q-icon 
          v-if="isAdmin" 
          name="person" 
          size="16px"
          class="q-ml-xs text-primary" 
        />
        <q-badge 
          v-if="isBanned" 
          color="negative" 
          class="q-ml-sm"
        >
          Banned
        </q-badge>
      </div>
    </q-item-section>

    <q-item-section v-if="isInvited" side>
      <div class="row no-wrap items-center">
        <q-btn 
          dense 
          flat 
          round 
          icon="check" 
          color="positive" 
          @click.stop="$emit('accept')" 
        />
        <q-btn 
          dense 
          flat 
          round 
          icon="close" 
          color="negative" 
          @click.stop="$emit('decline')" 
        />
      </div>
    </q-item-section>

    <q-item-section v-else side>
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
import type { Channel } from 'src/types'
import { truncate } from 'src/utils'

interface Props {
  channel: Channel
  isAdmin?: boolean
  isInvited?: boolean
  isBanned?: boolean
  hasUnread?: boolean
  maxNameLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false,
  isInvited: false,
  isBanned: false,
  hasUnread: false,
  maxNameLength: 15,
})

defineEmits<{
  click: []
  accept: []
  decline: []
}>()

const truncatedName = computed(() => truncate(props.channel.channelName, props.maxNameLength))
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

.channel-highlight {
  background-color: rgba(var(--highlight-color), 0.08);
}

.channel-highlight::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--highlight-color);
  box-shadow: 0 0 6px var(--highlight-color);
}

body.body--dark .channel-highlight {
  color: var(--q-secondary);
  text-shadow: 0 0 6px var(--q-secondary);
  --highlight-color: var(--q-secondary);
}

body.body--light .channel-highlight {
  color: var(--q-primary);
  text-shadow: 0 0 6px var(--q-primary);
  --highlight-color: var(--q-primary);
}

.channel-invited {
  border-left: 3px solid var(--highlight-color);
  background-color: rgba(0, 0, 0, 0.04);
}

body.body--light .channel-invited {
  --highlight-color: var(--q-primary);
}

body.body--dark .channel-invited {
  --highlight-color: var(--q-secondary);
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
