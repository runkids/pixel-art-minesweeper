<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  confirmText: {
    type: string
    default: 'Confirm'
  }
  cancelText: {
    type: string
    default: 'Cancel'
  }
}>()

const emits = defineEmits(['update:modelValue', 'close', 'confirm'])

const elRef = ref()

watch(
  () => props.modelValue,
  async (v) => {
    await nextTick()
    if (v) {
      elRef.value.showModal()
    } else {
      elRef.value.close()
    }
  },
  {
    immediate: true,
  }
)

const handleClose = () => {
  elRef.value.close()
  emits('close')
  emits('update:modelValue', false)
}

const handleConfirm = () => {
  elRef.value.close()
  emits('confirm')
  emits('update:modelValue', false)
}
</script>

<script lang="ts">
export default {
  name: 'heart',
}
</script>

<template>
  <dialog ref="elRef" class="nes-dialog is-dark is-rounded max-w-[720px]">
    <slot />
    <menu class="dialog-menu flex items-center justify-end gap-x-1">
      <button class="nes-btn" @click="handleClose">{{ cancelText }}</button>
      <button class="nes-btn is-primary" @click="handleConfirm">{{ confirmText }}</button>
    </menu>
  </dialog>
</template>
