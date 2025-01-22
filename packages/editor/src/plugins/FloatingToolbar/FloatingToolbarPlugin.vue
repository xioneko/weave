<script lang="ts">
export interface FloatingToolbarPluginApi {
  registerItem: (item: FloatingToolbarItem) => () => void
  disable: () => void
  enable: () => void
}

function isBackward(anchor: Node, focus: Node, anchorOffset: number, focusOffset: number) {
  return anchor === focus
    ? anchorOffset > focusOffset
    : anchor.compareDocumentPosition(focus) === Node.DOCUMENT_POSITION_PRECEDING
}
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import * as css from "./FloatingToolbar.css"
import {
  FloatingToolbarItem,
  getDefaultFloatingToolbarItems,
  ToolbarItem,
} from "./FloatingToolbarItem"
import { type vDismissableValue, vDismissable } from "@weave/ui/components"
import * as Popper from "@weave/ui/components/Popper"
import { $getSelection, $isRangeSelection } from "lexical"
import { computed, onMounted, onScopeDispose, onUnmounted, ref, shallowRef } from "vue"

const { editor } = useComposerContext()

const showToolbar = ref(false)
const disabled = ref(false)
const popperAnchor = ref(DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 }))
const virtualElement = computed<Popper.Measurable>(() => {
  const rect = popperAnchor.value
  return { getBoundingClientRect: () => rect }
})

let isPointerReleased = true
let afterPointerReleased: (() => void) | null = null
const handlePointerDown = (event: PointerEvent) => {
  isPointerReleased = false
  window.clearTimeout(showTimeout)
  document.addEventListener(
    "pointerup",
    (event: PointerEvent) => {
      isPointerReleased = true
      afterPointerReleased?.()
    },
    { once: true },
  )
}
onMounted(() => {
  const rootElement = editor.getRootElement()!
  rootElement.addEventListener("pointerdown", handlePointerDown)
  onScopeDispose(() => {
    rootElement.removeEventListener("pointerdown", handlePointerDown)
  })
})

const defaultItems = getDefaultFloatingToolbarItems(editor)
const toolbarItems = shallowRef(defaultItems)
let showTimeout: number | undefined
onUnmounted(
  editor.registerUpdateListener(() => {
    const selection = editor.read($getSelection)
    if (disabled.value || !selection || !$isRangeSelection(selection) || selection.isCollapsed()) {
      window.clearTimeout(showTimeout)
      afterPointerReleased = null
      if (showToolbar.value) showToolbar.value = false
      return
    }

    if (showToolbar.value) {
      toolbarItems.value.forEach(item => item.onUpdate?.(selection))
      return
    }

    if (!isPointerReleased) {
      afterPointerReleased = () => {
        showTimeout = window.setTimeout(() => {
          toolbarItems.value.forEach(item => item.onUpdate?.(selection))
          tryShowToolbar()
        }, 100)
        afterPointerReleased = null
      }
    }
  }),
)

let popperSide: Popper.PopperContentProps["side"] = "top"
function tryShowToolbar() {
  const domSelection = window.getSelection()
  if (!domSelection) return

  const selectedText = domSelection.toString()
  if (/^[\n\r]*$/.test(selectedText)) return

  const isSingleLine = !selectedText.includes("\n")
  if (isSingleLine) {
    popperAnchor.value = domSelection.getRangeAt(0).getBoundingClientRect()
    popperSide = "top"
    showToolbar.value = true
    return
  }

  const anchor = domSelection.anchorNode
  const focus = domSelection.focusNode
  if (!anchor || !focus) return

  const backward = domSelection.direction
    ? domSelection.direction === "backward"
    : isBackward(anchor, focus, domSelection.anchorOffset, domSelection.focusOffset)
  if (backward) {
    const range = new Range()
    if (focus.nodeType === Node.TEXT_NODE) {
      range.setStart(focus, Math.max(domSelection.focusOffset - 1, 0))
      range.setEndAfter(focus)
    } else {
      range.selectNodeContents(focus)
    }
    popperAnchor.value = range.getBoundingClientRect()
    popperSide = "top"
    showToolbar.value = true
  } else {
    const range = new Range()
    if (focus.nodeType === Node.TEXT_NODE) {
      range.setStartBefore(focus)
      range.setEnd(focus, Math.min(domSelection.focusOffset + 1, focus.textContent?.length ?? 0))
    } else {
      range.selectNodeContents(focus)
    }
    popperAnchor.value = range.getBoundingClientRect()
    popperSide = "bottom"
    showToolbar.value = true
  }
}

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown() {
    showToolbar.value = false
  },
  onPointerDownOutside() {
    showToolbar.value = false
  },
}

defineExpose<FloatingToolbarPluginApi>({
  registerItem(item) {
    toolbarItems.value.push(item)
    return () => {
      const index = toolbarItems.value.indexOf(item)
      if (index !== -1) {
        toolbarItems.value.splice(index, 1)
      }
    }
  },
  disable() {
    disabled.value = true
    showToolbar.value = false
  },
  enable() {
    disabled.value = false
  },
})
</script>

<template>
  <Popper.Root>
    <Popper.Anchor :virtual-element="virtualElement" />
    <Popper.Transition @enter="Popper.fadeIn" @leave="Popper.fadeOut">
      <Popper.Content
        v-if="showToolbar"
        :class="['FloatingToolbar__root', css.root]"
        :side="popperSide"
        :side-offset="5"
        v-dismissable="handleDismiss"
      >
        <ToolbarItem
          v-for="{ component, id } in toolbarItems"
          :key="id"
          :component
          :class="['FloatingToolbar__item', css.item]"
        />
      </Popper.Content>
    </Popper.Transition>
  </Popper.Root>
</template>
