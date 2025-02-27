<script lang="ts">
type BlockDNDTarget = {
  block: BaseBlockNode
  dom: HTMLElement
}

function getDropIntent(event: DragEvent, domRect: DOMRect): "above" | "below" {
  return event.clientY < domRect.top + domRect.height / 2 ? "above" : "below"
}
</script>

<script setup lang="ts">
import { useComposerContext, getViewportElement } from "#components"
import {
  BaseBlockNode,
  $findClosestBlockFrom,
  $isBlockSelection,
  SELECT_BLOCK_COMMAND,
} from "#core/nodes"
import { debounce } from "#shared/utils.ts"
import { mergeRegister } from "@lexical/utils"
import * as css from "./Indicator.css"
import { DragIndicator } from "@weave/ui/icons"
import {
  $getSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  DRAGEND_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from "lexical"
import {
  ref,
  onMounted,
  onScopeDispose,
  watch,
  useTemplateRef,
  CSSProperties,
  onUnmounted,
} from "vue"
import { $wrapNodeIfRequired } from "#shared/node.ts"

const { editor } = useComposerContext()

const dragTarget = ref<BlockDNDTarget | null>(null)
const isDragging = ref(false)
const dragHandleTransform = ref<string>("")
const dropIndicatorRef = useTemplateRef("dropIndicatorKey")

let rootElement: HTMLElement
let viewportElement: HTMLElement
const DragIndicatorHeight = 20

function getDNDTarget(event: MouseEvent): BlockDNDTarget | null {
  const rootElementStyle = window.getComputedStyle(rootElement)
  const x =
    rootElement.getBoundingClientRect().right -
    parseInt(rootElementStyle.borderRight || "0") -
    parseInt(rootElementStyle.paddingRight || "0") -
    5
  const element = document.elementFromPoint(x, event.clientY) as HTMLElement
  if (element) {
    const target = editor.read(() => $findClosestBlockFrom(element))
    if (target) return { block: target.node, dom: target.element }
  }
  return null
}

function computeDropIndicatorStyle(event: DragEvent, target: HTMLElement): CSSProperties {
  const rect = target.getBoundingClientRect()
  const viewportRect = viewportElement.getBoundingClientRect()
  const isAbove = getDropIntent(event, rect) === "above"
  // indentation -> "padding-inline-start": "calc(xxx)",
  const indentation = parseFloat(target.style.paddingInlineStart.slice(5) || "0")

  let y: number = viewportElement.scrollTop - viewportRect.y
  if (isAbove) {
    const sibling = target.previousElementSibling
    if (sibling) {
      const siblingRect = sibling.getBoundingClientRect()
      y += (siblingRect.bottom + rect.top) / 2
    } else {
      y += rect.top
    }
  } else {
    const sibling = target.nextElementSibling
    if (sibling) {
      const siblingRect = sibling.getBoundingClientRect()
      y += (siblingRect.top + rect.bottom) / 2
    } else {
      y += rect.bottom
    }
  }

  return {
    transform: `translate(${rect.left + indentation - viewportRect.x}px, ${y}px)`,
    width: `${rect.width - indentation}px`,
  }
}

watch(dragTarget, block => {
  if (!block || isDragging.value) return

  const blockElement = block.dom
  const blockRect = blockElement.getBoundingClientRect()
  const viewportRect = viewportElement.getBoundingClientRect()

  const x =
    blockRect.x -
    viewportRect.x +
    // indentation -> "padding-inline-start": "calc(xxx)",
    parseFloat(blockElement.style.paddingInlineStart.slice(5) || "0")

  const blockStyle = window.getComputedStyle(blockElement)
  const y =
    blockRect.y -
    viewportRect.y +
    viewportElement.scrollTop +
    parseFloat(blockStyle.lineHeight) / 2 +
    // parseFloat(blockStyle.marginTop) +
    parseFloat(blockStyle.paddingTop) -
    DragIndicatorHeight / 2

  dragHandleTransform.value = `translate(${x - 24}px, ${y}px)`
})

onMounted(() => {
  rootElement = editor.getRootElement()!
  viewportElement = getViewportElement(rootElement)

  const _handleMouseOver = (event: MouseEvent) => {
    dragTarget.value = getDNDTarget(event)
  }
  const handleMouseOver = debounce(_handleMouseOver, 56)
  viewportElement.addEventListener("mousemove", handleMouseOver)
  onScopeDispose(() => {
    viewportElement.removeEventListener("mousemove", handleMouseOver)
  })
})

onUnmounted(
  mergeRegister(
    editor.registerCommand(
      DRAGSTART_COMMAND,
      event => {
        const selection = editor.read($getSelection)
        if (!$isBlockSelection(selection)) return false

        const blockKeys = selection._blocks
        let dropTarget: BlockDNDTarget | null = null
        isDragging.value = true
        const dataTransfer = event.dataTransfer!
        dataTransfer.effectAllowed = "copyMove"

        const dropIndicator = dropIndicatorRef.value!
        // Avoid flickering, this value should be reset by `computeDropIndicatorStyle`
        dropIndicator!.style.transform = "translateX(-9999px)"

        const handleDragOver = (event: DragEvent) => {
          event.preventDefault()
          event.dataTransfer!.dropEffect = "move"
          const target = getDNDTarget(event)
          if (target) {
            if (
              !blockKeys.has(target.block.__key) &&
              Array.from(blockKeys).every(key => {
                const dom = editor.getElementByKey(key)
                return dom && !dom.contains(target.dom)
              })
            ) {
              dropTarget = target
              Object.assign(dropIndicator.style, computeDropIndicatorStyle(event, dropTarget.dom))
            }
          }
        }

        const handleDrop = (event: DragEvent) => {
          isDragging.value = false
          if (!dropTarget) return
          editor.update(() => {
            const selection = $getSelection()
            if ($isBlockSelection(selection)) {
              const blocks = selection.getNodes()
              // Is blocks sorting necessary?
              // blocks.sort((a, b) => {
              //   const elemA = editor.getElementByKey(a.__key)!
              //   const elemB = editor.getElementByKey(b.__key)!
              //   return elemA.compareDocumentPosition(elemB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
              // })
              const dropIntent = getDropIntent(event, dropTarget!.dom.getBoundingClientRect())
              const block = dropTarget!.block
              if (dropIntent === "above") {
                for (let i = 0; i < blocks.length; ++i) {
                  block.insertBefore($wrapNodeIfRequired(blocks[i]))
                }
              } /* dropIntent === "below" */ else {
                for (let i = blocks.length - 1; i >= 0; --i) {
                  block.insertAfter($wrapNodeIfRequired(blocks[i]))
                }
              }
            }
          })
          rootElement.removeEventListener("dragover", handleDragOver)
        }

        rootElement.addEventListener("dragover", handleDragOver)
        rootElement.addEventListener("drop", handleDrop, { once: true })

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      DRAGEND_COMMAND,
      event => {
        if (isDragging.value) {
          isDragging.value = false
          return true
        }
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    ),
    editor.registerCommand(
      DROP_COMMAND,
      event => {
        if (isDragging.value) return true
        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    ),
  ),
)

const handlePointerDown = (event: PointerEvent) => {
  const draggedBlock = dragTarget.value
  if (!draggedBlock) return
  editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: draggedBlock.block })
  event.target!.addEventListener(
    "pointerup",
    () => {
      const draggedBlock = dragTarget.value
      if (!draggedBlock) return
      rootElement.focus({ preventScroll: true })
      window.getSelection()?.removeAllRanges()
    },
    { once: true },
  )
}

const handleDragStart = (event: DragEvent) => {
  if (!dragTarget.value) return
  event.dataTransfer!.setDragImage(dragTarget.value.dom, 0, 0)
  editor.dispatchCommand(DRAGSTART_COMMAND, event)
}

const handleDragEnd = (event: DragEvent) => {
  editor.dispatchCommand(DRAGEND_COMMAND, event)
}
</script>

<template>
  <div
    :data-show="dragTarget !== null || undefined"
    :data-dragging="isDragging || undefined"
    :class="['DragHandle__dragIndicator', css.dragIndicator]"
    :style="{
      transform: dragHandleTransform,
    }"
    draggable="true"
    @pointerdown="handlePointerDown"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <DragIndicator :height="DragIndicatorHeight" />
  </div>
  <div
    v-show="isDragging"
    :class="['DragHandle__dropIndicator', css.dropIndicator]"
    ref="dropIndicatorKey"
  />
</template>
