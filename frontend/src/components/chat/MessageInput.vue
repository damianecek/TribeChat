<template>
  <div class="row items-center q-px-md q-mt-auto">
    <div class="col">
      <q-input
        v-model="inputText"
        autogrow
        placeholder="Type a message or command..."
        filled
        dense
        @update:model-value="$emit('typing')"
        @keydown.enter.prevent="handleEnter"
      >
        <template #append>
          <q-btn @click="$emit('send')" round dense flat icon="send" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'typing': []
}>()

const inputText = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  inputText.value = val
})

watch(inputText, (val) => {
  emit('update:modelValue', val)
})

const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    // Allow shift+enter for new line
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    inputText.value = inputText.value.substring(0, start) + '\n' + inputText.value.substring(end)
    void nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 1
    })
  } else {
    emit('send')
  }
}
</script>
