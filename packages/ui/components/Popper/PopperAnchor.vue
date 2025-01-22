<script lang="ts">
export interface PopperAnchorProps {
  virtualElement?: Measurable | null
}
</script>

<script setup lang="ts">
import { inject, watchEffect } from "vue"
import { PopperRootContext, type Measurable } from "./PopperRoot.vue"
import el from "../shared/polymorphic"
import { useForwardRef } from "../shared/useForwardRef"

const { virtualElement } = defineProps<PopperAnchorProps>()

const { anchor } = inject(PopperRootContext)!

const [anchorRef, forwardRef] = useForwardRef()

watchEffect(() => {
  if (virtualElement !== undefined) {
    anchor.value = virtualElement
  } else {
    anchor.value = anchorRef.value
  }
})
</script>

<template>
  <el.div v-if="!virtualElement" :ref="forwardRef">
    <slot />
  </el.div>
</template>
