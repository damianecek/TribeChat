<template>
  <div class="member-drawer-root column fit">
    <!-- Header -->
    <div class="col-auto text-subtitle5 q-pa-md">
      Members ({{ members.length }})
    </div>

    <!-- Member List -->
    <q-scroll-area class="col fit">
      <q-list class="member-list">
        <q-item
          v-for="member in members"
          :key="member.id"
          clickable
          @click="openProfile(member)"
        >
          <q-item-section avatar>
            <q-avatar
              :icon="member.icon || 'person'"
              color="primary"
              text-color="white"
              class="status-avatar"
              :style="{ '--status-color': getStatusColor(member.status) }"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="member-name">{{ member.name }}</q-item-label>
            <q-item-label caption>{{ member.status }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Member } from 'src/types'

const router = useRouter()

const members = ref<Member[]>([
  { id: 1, name: 'Alice', status: 'Online', icon: 'person' },
  { id: 2, name: 'Bob', status: 'Away', icon: 'person' },
  { id: 3, name: 'Charlie', status: 'Offline', icon: 'person' }
])

// Map status to colors
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online': return 'limegreen'
    case 'away': return 'gold'
    case 'busy': return 'orangered'
    case 'offline': return 'gray'
    default: return 'lightgray'
  }
}

async function openProfile(member: Member) {
  await router.push(`/profile/${member.id}`)
}
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
  overflow: visible; /* ensure the outline isn’t clipped */
}

/* Outer outline ring */
.status-avatar::after {
  content: "";
  position: absolute;
  inset: -3px; /* size of gap + ring thickness */
  border-radius: 50%;
  border: 2px solid var(--status-color, transparent);
  box-sizing: border-box;
  pointer-events: none; /* so clicks still hit the avatar */
}


/* Light mode overrides */
body.body--light .member-list {
  --menu-text-color: #555;
  --menu-hover-color: #000;
}

/* Dark mode overrides */
body.body--dark .member-list {
  --menu-text-color: #aaa;
  --menu-hover-color: #fff;
}
</style>
