<template>
  <!-- Add Channel Dialog -->
  <q-dialog v-model="showAdd">
    <q-card style="min-width: 300px;">
      <q-card-section>
        <div class="text-h6">Create New Channel</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="addChannelName" label="Channel name" autofocus />
        <q-toggle v-model="addIsPublic" label="Private" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Create" color="primary" @click="handleAdd" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Edit Channel Dialog -->
  <q-dialog v-model="showEdit">
    <q-card style="min-width: 300px;">
      <q-card-section>
        <div class="text-h6">Edit Channel</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="editChannelName" label="New name" autofocus />
        <q-toggle v-model="editIsPublic" label="Private" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" v-close-popup />
        <q-btn flat label="Save" color="primary" @click="handleEdit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Channel } from 'src/types'

interface Props {
  modelValue: {
    showAdd: boolean
    showEdit: boolean
    editChannel?: Channel | null
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']]
  'add': [name: string, isPublic: boolean]
  'edit': [channelId: string, name: string, isPublic: boolean]
}>()

const showAdd = ref(props.modelValue.showAdd)
const showEdit = ref(props.modelValue.showEdit)
const addChannelName = ref('')
const addIsPublic = ref(false)
const editChannelName = ref('')
const editIsPublic = ref(false)

watch(() => props.modelValue.showAdd, (val) => {
  showAdd.value = val
  if (val) {
    addChannelName.value = ''
    addIsPublic.value = false
  }
})

watch(() => props.modelValue.showEdit, (val) => {
  showEdit.value = val
  if (val && props.modelValue.editChannel) {
    editChannelName.value = props.modelValue.editChannel.channelName
    editIsPublic.value = props.modelValue.editChannel.isPublic
  }
})

watch(showAdd, (val) => {
  emit('update:modelValue', { ...props.modelValue, showAdd: val })
})

watch(showEdit, (val) => {
  emit('update:modelValue', { ...props.modelValue, showEdit: val })
})

const handleAdd = () => {
  const name = addChannelName.value.trim()
  if (name) {
    emit('add', name, addIsPublic.value)
    showAdd.value = false
  }
}

const handleEdit = () => {
  const name = editChannelName.value.trim()
  if (name && props.modelValue.editChannel) {
    emit('edit', props.modelValue.editChannel.id, name, editIsPublic.value)
    showEdit.value = false
  }
}
</script>
