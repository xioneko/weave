<script lang="ts" setup generic="Item extends Record<string, any>">
import type { TreeItemProps } from "#components/Tree"
import { useForwardRef } from "../../shared/useForwardRef"
import TreeItem from "../TreeItem.vue"
import TreeItemDropIndicator from "../TreeItemDropIndicator.vue"
import { TreeRootContext } from "../TreeRoot.vue"
import {
  attachInstruction,
  extractInstruction,
  type Instruction,
  type ItemMode,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { computed, h, inject, ref, render, toRaw, watchPostEffect } from "vue"

const props = defineProps<TreeItemProps<Item>>()

const { expandedKeys } = inject(TreeRootContext)!

const [itemRef, forwardRef] = useForwardRef()

const setExpansion = (value: boolean) => {
  if (value) {
    expandedKeys.value.add(props.value.itemKey)
  } else {
    expandedKeys.value.delete(props.value.itemKey)
  }
}

const instruction = ref<Instruction | null>(null)
const isInitialExpanded = ref(false)
const itemMode = computed<ItemMode>(() => {
  if (props.value.children.length > 0) return "expanded"
  if (props.value.index === props.value.parent?.children.length - 1) return "last-in-group"
  return "standard"
})
let expandTimer: number | undefined
const cancelExpand = () => {
  if (expandTimer) {
    clearTimeout(expandTimer)
    expandTimer = undefined
  }
}

watchPostEffect(onCleanup => {
  const element = itemRef.value!
  const itemData = toRaw(props)
  onCleanup(
    combine(
      draggable({
        element: element,
        getInitialData: () => itemData,
        onDragStart() {
          isInitialExpanded.value = element.hasAttribute("data-expanded")
          setExpansion(false)
        },
        onDrop() {
          if (isInitialExpanded.value) {
            setExpansion(true)
          }
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
            render({ container }) {
              return render(
                h("div", { class: "drag-preview " }, element.textContent || ""),
                container,
              )
            },
            nativeSetDragImage,
          })
        },
      }),
      dropTargetForElements({
        element,
        getData({ input, element }) {
          return attachInstruction(itemData, {
            input,
            element,
            indentPerLevel: 10,
            currentLevel: itemData.level,
            mode: itemMode.value,
            block: [],
          })
        },
        canDrop({ source }) {
          return source.data.itemKey !== itemData.itemKey
        },
        onDrag({ self, source }) {
          const instruction_ = extractInstruction(self.data)
          if (source.data.itemKey !== itemData.itemKey) {
            instruction.value = instruction_
            if (
              !expandTimer &&
              instruction_?.type === "make-child" &&
              element.hasAttribute("data-collapsed")
            ) {
              expandTimer = window.setTimeout(() => {
                setExpansion(true)
                expandTimer = undefined
              }, 500)
            } else if (instruction_?.type !== "make-child") {
              cancelExpand()
            }
          } else if (instruction_?.type === "reparent") {
            instruction.value = instruction_
          } else {
            instruction.value = null
          }
        },
        onDragLeave() {
          instruction.value = null
          cancelExpand()
        },
        onDrop() {
          if (instruction.value?.type === "make-child") {
            setExpansion(true)
          }
          instruction.value = null
          cancelExpand()
        },
      }),
      monitorForElements({
        canMonitor({ source }) {
          return source.data.itemKey !== itemData.itemKey
        },
      }),
    ),
  )
})
</script>

<template>
  <TreeItem v-bind="props" :ref="forwardRef" v-slot="slotProps">
    <slot v-bind="slotProps" />
    <TreeItemDropIndicator v-if="instruction" :instruction />
  </TreeItem>
</template>

<style lang="css" scoped>
.drag-preview {
  border-radius: 4px;
  background-color: white;
  padding: 6px 12px;
}
</style>
