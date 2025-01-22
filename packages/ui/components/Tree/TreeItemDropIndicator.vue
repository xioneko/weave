<script lang="ts">
export interface TreeItemDropIndicatorProps {
  instruction: Instruction
}
</script>

<script lang="ts" setup>
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import { computed } from 'vue'
import * as css from './Tree.css'

const { instruction: instructionProp } = defineProps<TreeItemDropIndicatorProps>()
const isBlocked = computed(() => instructionProp.type === 'instruction-blocked')
const instruction = computed(() =>
  isBlocked.value ? (instructionProp as any).desired : instructionProp,
)
const horizontalIntent = computed(() => {
  return instruction.value.type === 'reparent'
    ? `${instruction.value.desiredLevel * instruction.value.indentPerLevel}px`
    : `${instruction.value.currentLevel * instruction.value.indentPerLevel}px`
})
</script>

<template>
  <div
    :class="
      instruction.type === 'make-child'
        ? css.outlineStyles({ blocked: isBlocked })
        : css.lineStyles({
            side: instruction.type === 'reorder-below' ? 'below' : 'above',
            blocked: isBlocked,
          })
    "
    :style="
      assignInlineVars({
        [css.horizontalIntent]: horizontalIntent,
      })
    "
  />
</template>
