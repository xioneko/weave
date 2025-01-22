<script lang="ts">
import { defineComponent, ref } from 'vue'
import { vDismissable, type vDismissableValue } from '../vDismissable'

export default defineComponent({
  name: 'DismissableLayerStoryNested',
  setup() {
    const open = ref(false)
    const buttonRef = ref<HTMLButtonElement | null>(null)
    const handleDismiss: vDismissableValue = {
      onPointerDownOutside(element, target) {
        if (buttonRef.value!.contains(target)) return
        open.value = false
      },
    }
    const handleClick = () => {
      open.value = !open.value
    }

    return { open, buttonRef, handleDismiss, handleClick }
  },
  directives: { dismissable: vDismissable },
})
</script>

<template>
  <div
    v-dismissable="handleDismiss"
    :style="{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      verticalAlign: 'middle',
      padding: 20 + 'px',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 10 + 'px',
      marginTop: 20 + 'px',
    }"
  >
    <div>
      <button ref="buttonRef" type="button" @click="handleClick">
        {{ open ? 'Close' : 'Open' }} new layer
      </button>
    </div>
    <DismissableLayerStoryNested v-if="open" />
  </div>
</template>
