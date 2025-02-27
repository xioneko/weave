<script lang="ts">
export interface ImageBlockDecoratorProps {
  nodeKey: NodeKey
  src?: string
  width?: number
}
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import { SELECT_BLOCK_COMMAND } from "#core/nodes"
import { clamp } from "#shared/utils.ts"
import { ImageBlockNode } from "../ImageBlockNode"
import * as css from "./ImageBlockDecorator.css"
import { $getNodeByKey, NodeKey } from "lexical"
import { ref, useTemplateRef } from "vue"

const { nodeKey, width, src } = defineProps<ImageBlockDecoratorProps>()

const { editor } = useComposerContext()

const imgRef = useTemplateRef("imgKey")
const rootRef = useTemplateRef("rootKey")
const showControls = ref(false)
const isResizing = ref(false)

const handleMouseEnter = () => (showControls.value = true)
const handleMouseLeave = () => {
  if (!isResizing.value) {
    showControls.value = false
  }
}

const handleRootPointerUp = (event: PointerEvent) => {
  if (event.target === rootRef.value!) {
    const imgRect = imgRef.value!.getBoundingClientRect()
    if (event.clientX > imgRect.right) {
      editor.update(() => {
        const node = $getNodeByKey<ImageBlockNode>(nodeKey)!
        node.selectNext()
      })
    } else {
      editor.update(() => {
        const node = $getNodeByKey<ImageBlockNode>(nodeKey)!
        node.selectPrevious()
      })
    }
  }
}

const handleImageClick = () => {
  const imgBlockNode = editor.read(() => $getNodeByKey<ImageBlockNode>(nodeKey))!
  editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: imgBlockNode })
}

const handleResizerPointerDown = (event: PointerEvent, side: "left" | "right") => {
  isResizing.value = true
  event.preventDefault()

  const img = imgRef.value!
  const startX = event.clientX
  const rect = img.getBoundingClientRect()
  const startWidth = rect.width
  const maxWidth = rootRef.value!.offsetWidth
  let endWidth = startWidth
  const originalCursor = document.body.style.cursor
  document.body.style.cursor = "col-resize"

  const sideFactor = side === "left" ? -1 : 1
  let frameId: number | undefined
  const handlePointerMove = (event: PointerEvent) => {
    if (frameId) return
    frameId = requestAnimationFrame(() => {
      const delta = (event.clientX - startX) * 2 * sideFactor
      const newWidth = clamp(startWidth + delta, 36, maxWidth)
      img.style.width = `${newWidth}px`
      endWidth = newWidth
      frameId = undefined
    })
  }

  const handlePointerUp = () => {
    editor.update(() => {
      const node = $getNodeByKey<ImageBlockNode>(nodeKey)!
      node.setWidth(endWidth)
    })
    document.body.style.cursor = originalCursor
    isResizing.value = false

    document.removeEventListener("pointermove", handlePointerMove)
  }

  document.addEventListener("pointermove", handlePointerMove)
  document.addEventListener("pointerup", handlePointerUp, { once: true })
}

const handleDragStart = (event: DragEvent) => {
  const node = editor.read(() => $getNodeByKey<ImageBlockNode>(nodeKey))!
  editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node })
}
</script>

<template>
  <div
    ref="rootKey"
    :data-resizing="isResizing || undefined"
    :class="['ImageBlockDecorator__root', css.root]"
    @pointerup="handleRootPointerUp"
  >
    <div
      :class="['ImageBlockDecorator__container', css.container]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <img
        ref="imgKey"
        :src="src"
        :style="{
          width: width ? `${width}px` : 'auto',
          maxWidth: '100%',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }"
        @click="handleImageClick"
        @dragstart="handleDragStart"
      />
      <div
        :data-show="showControls || undefined"
        :class="['ImageBlockDecorator__controls', css.controls]"
      >
        <div
          :class="['ImageBlockDecorator__resizer-left', css.resizer.left]"
          @pointerdown="handleResizerPointerDown($event, 'left')"
        ></div>
        <div
          :class="['ImageBlockDecorator__resizer-right', css.resizer.right]"
          @pointerdown="handleResizerPointerDown($event, 'right')"
        ></div>
      </div>
    </div>
  </div>
</template>
