<template>
  <div class="member-drawer-root column fit">
    <!-- Header -->
    <div class="col-auto text-subtitle5 q-pa-md">
          Members ({{members.length }})
    </div>

    <!-- Member List -->
    <q-scroll-area class="col fit">
      <q-list>
        <q-item
          v-for="member in members"
          :key="member.id"
          clickable
          @click="openProfile(member)"
        >
          <q-item-section avatar>
            <q-avatar :icon="member.icon || 'person'" color="primary" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ member.name }}</q-item-label>
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

// Example static members — replace with props or store later
const members = ref<Member[]>([
  { id: 1, name: 'Alice', status: 'Online', icon: 'person' },
  { id: 2, name: 'Bob', status: 'Away', icon: 'person' },
  { id: 3, name: 'Charlie', status: 'Offline', icon: 'person' }
])

async function openProfile(member: Member) {
  await router.push(`/profile/${member.id}`)
}
</script>


