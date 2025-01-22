<script lang="ts">
export interface PopperArrowProps {
  width?: number
  height?: number
  asChild?: boolean
}
</script>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { PopperContentContext } from './PopperContent.vue'
import el from '../shared/polymorphic'

const { width = 10, height = 5, asChild } = defineProps<PopperArrowProps>()
defineOptions({
  inheritAttrs: false,
})

const { arrow, arrowX, arrowY, shouldHideArrow, popperSide } = inject(PopperContentContext)!

const arrowStyle = computed(() => {
  const popperSide_ = popperSide.value
  const arrowSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[popperSide_]
  return {
    [arrowSide]: 0,
    transformOrigin: {
      top: '',
      right: '0 0',
      bottom: 'center 0',
      left: '100% 0',
    }[popperSide_],
    transform: {
      top: 'translateY(100%)',
      right: 'translateY(50%) rotate(90deg) translateX(-50%)',
      bottom: `rotate(180deg)`,
      left: 'translateY(50%) rotate(-90deg) translateX(50%)',
    }[popperSide_],
  }
})
</script>

<template>
  <span
    ref="arrow"
    :style="{
      position: 'absolute',
      left: arrowX !== undefined ? `${arrowX}px` : undefined,
      top: arrowY !== undefined ? `${arrowY}px` : undefined,
      ...arrowStyle,
      visibility: shouldHideArrow ? 'hidden' : undefined,
    }"
  >
    <el.svg
      v-bind="$attrs"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
      :style="{ display: 'block' }"
      :width="width"
      :height="height"
      :as-child="asChild"
    >
      <slot><polygon points="0,0 30,0 15,10" /></slot>
    </el.svg>
  </span>
</template>
