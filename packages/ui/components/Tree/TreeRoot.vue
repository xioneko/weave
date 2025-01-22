<script lang="ts">
interface TreeRootContextValue {
  expandedKeys: Ref<Set<PropertyKey>>
  selectedKeys: Ref<Set<PropertyKey>>
}

export interface TreeRootProps<Item extends Record<string, any>> {
  items: Item[] | Item
  selectedKeys?: Set<PropertyKey>
  defaultSelectedKeys?: Set<PropertyKey>
  expandedKeys?: Set<PropertyKey>
  defaultExpandedKeys?: Set<PropertyKey>
  multiple?: boolean
  getKey?: (item: Item) => string
  getChildren?: (item: Item) => Item[]
}

interface TreeRootEmits {
  "update:expandedKeys": [value: Set<PropertyKey>]
  "update:selectedKeys": [value: Set<PropertyKey>]
}

interface TreeRootSlots<Item extends Record<string, any>> {
  default: (props: { flattenItems: TreeIterator<Item>; expandedKeys: Set<PropertyKey> }) => any
}

export type TreeItemData = {
  item: TreeIteratorValue<any>
}

type FocusIntent = "first" | "last" | "prev" | "next" | "parent" | "child"

const MapKeyToFocusIntent: Record<string, FocusIntent> = {
  ArrowRight: "child",
  ArrowLeft: "parent",
  ArrowUp: "prev",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
}

export const TreeRootContext = Symbol("TreeRootContext") as InjectionKey<TreeRootContextValue>

export const {
  provideCollection,
  injectCollection,
  useCollect: useTreeItemCollect,
} = createCollection<TreeItemData>()
</script>

<script setup lang="ts" generic="Item extends Record<string, any>">
import { computed, provide, ref, watch, type InjectionKey, type Ref } from "vue"
import { createCollection } from "../shared/createCollection"
import { useControllableModel } from "../shared/useControllableModel"
import el from "../shared/polymorphic"
import { TreeIterator, type TreeIteratorOptions, type TreeIteratorValue } from "./TreeIterator"

const {
  items,
  selectedKeys: selectedKeysProp,
  defaultSelectedKeys = new Set(),
  expandedKeys: expandedKeysProp,
  defaultExpandedKeys = new Set(),
  multiple,
  getChildren = item => item.children as Item[],
  getKey = item => item.id as PropertyKey,
} = defineProps<TreeRootProps<Item>>()

const emit = defineEmits<TreeRootEmits>()

defineSlots<TreeRootSlots<Item>>()

const activeSelection = ref<{ anchorIndex: number; focusIndex: number } | null>(null)

watch(
  () => items,
  () => {
    activeSelection.value = null
  },
  { deep: 1 },
)

const selectedKeys = useControllableModel({
  value: () => selectedKeysProp,
  defaultValue: defaultSelectedKeys,
  onChange: value => emit("update:selectedKeys", value),
  deep: true,
})

const expandedKeys = useControllableModel({
  value: () => expandedKeysProp,
  defaultValue: defaultExpandedKeys,
  onChange: value => emit("update:expandedKeys", value),
})

const iteratorOptions = computed<TreeIteratorOptions<Item>>(() => {
  return {
    getChildren,
    shouldSkipChildren: item => {
      return !expandedKeys.value.has(getKey(item))
    },
    getKey,
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  let items: ReturnType<typeof getTreeItems>
  let currentIndex: number
  // 1. Roving focus
  const focusIntent = MapKeyToFocusIntent[event.key]
  if (focusIntent) {
    event.preventDefault()
    items = getTreeItems({ ordered: true })
    let targetIndex: number = -1
    currentIndex = items.findIndex(item => item.el === event.target)
    if (currentIndex > -1) {
      const currentItem = items[currentIndex]
      if (focusIntent === "child") {
        if (currentItem.el.hasAttribute("data-collapsed")) {
          // If the item is collapsed, expand it
          expandedKeys.value.add(currentItem.data.item.itemKey)
          return
        } else if (currentItem.el.hasAttribute("data-expanded")) {
          // Else if the item is expanded, move focus to the first child
          targetIndex = currentIndex + 1
        }
      } else if (focusIntent === "parent") {
        if (currentItem.el.hasAttribute("data-expanded")) {
          // If the item is expanded, collapse it
          expandedKeys.value.delete(currentItem.data.item.itemKey)
          return
        } else if (currentItem.data.item.parent) {
          // Else if the item has a parent, move focus to the parent
          const parentIndex = items.findIndex(
            item => item.data.item.itemKey === currentItem.data.item.parentKey,
          )
          targetIndex = parentIndex
        }
      }
    }
    switch (focusIntent) {
      case "first":
        targetIndex = 0
        break
      case "last":
        targetIndex = items.length - 1
        break
      case "prev":
        targetIndex = currentIndex - 1
        break
      case "next":
        targetIndex = currentIndex + 1
        break
    }

    if (targetIndex > -1 && targetIndex <= items.length - 1) {
      items[targetIndex].el.focus()
      activeSelection.value = { anchorIndex: targetIndex, focusIndex: targetIndex }
    }
  }

  // 2. Handle selection
  items ??= getTreeItems({ ordered: true })
  currentIndex ??= items.findIndex(item => item.el === event.target)
  if (currentIndex > -1) {
    const currentItem = items![currentIndex]
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      // Toggle expanded state
      if (currentItem.el.hasAttribute("data-collapsed")) {
        expandedKeys.value.add(currentItem.data.item.itemKey)
      } else if (currentItem.el.hasAttribute("data-expanded")) {
        expandedKeys.value.delete(currentItem.data.item.itemKey)
      }
      if (event.key === "Enter") {
        // Replace selection
        selectedKeys.value.clear()
        selectedKeys.value.add(currentItem.data.item.itemKey)
        activeSelection.value = { anchorIndex: currentIndex, focusIndex: currentIndex }
      }
    } else if (
      multiple &&
      event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      (focusIntent === "next" || focusIntent === "prev")
    ) {
      event.preventDefault()
      // Toggle selection
      const focusedItem = items![focusIntent === "next" ? currentIndex + 1 : currentIndex - 1]
      if (focusedItem) {
        if (focusedItem.el.hasAttribute("data-selected")) {
          selectedKeys.value.delete(focusedItem.data.item.itemKey)
        } else {
          selectedKeys.value.add(focusedItem.data.item.itemKey)
        }
      }
      activeSelection.value = { anchorIndex: currentIndex, focusIndex: currentIndex }
    }
  }
}

const setRangeSelection = (
  items: { data: TreeItemData }[],
  start: number,
  end: number,
  selected: boolean,
) => {
  if (start > end) [start, end] = [end, start]
  for (let i = start; i <= end; i++) {
    if (selected) {
      selectedKeys.value.add(items[i].data.item.itemKey)
    } else {
      selectedKeys.value.delete(items[i].data.item.itemKey)
    }
  }
}

const handleMouseDown = (event: MouseEvent) => {
  const items = getTreeItems({ ordered: true })
  const targetIndex = items.findIndex(item => item.el.contains(event.target as Node))
  if (targetIndex > -1) {
    const targetItem = items[targetIndex]
    if (multiple && event.shiftKey) {
      event.preventDefault() // Prevent text selection
      // Range selection
      if (activeSelection.value !== null) {
        const { focusIndex, anchorIndex } = activeSelection.value
        if (((focusIndex - anchorIndex) ^ (targetIndex - anchorIndex)) < 0) {
          // If target and focus are on the opposite side of anchor
          setRangeSelection(items, focusIndex, anchorIndex, false)
          setRangeSelection(items, targetIndex, anchorIndex, true)
        } else if (Math.abs(focusIndex - anchorIndex) > Math.abs(targetIndex - anchorIndex)) {
          // Else if targetIndex is closer to anchorIndex than focusIndex
          setRangeSelection(items, focusIndex, targetIndex, false)
          selectedKeys.value.add(targetItem.data.item.itemKey)
        } else {
          // Else if focusIndex is closer to anchorIndex than targetIndex
          setRangeSelection(items, focusIndex, targetIndex, true)
        }
        targetItem.el.focus({ preventScroll: true })
        activeSelection.value.focusIndex = targetIndex
      }
    } else if (multiple && event.ctrlKey) {
      // Toggle selection
      if (targetItem.el.hasAttribute("data-selected")) {
        selectedKeys.value.delete(targetItem.data.item.itemKey)
      } else {
        selectedKeys.value.add(targetItem.data.item.itemKey)
      }
      activeSelection.value = { anchorIndex: targetIndex, focusIndex: targetIndex }
    } else {
      // Replace with single selection
      selectedKeys.value.clear()
      selectedKeys.value.add(targetItem.data.item.itemKey)
      activeSelection.value = { anchorIndex: targetIndex, focusIndex: targetIndex }
    }
  }
}

const handleFocus = (event: FocusEvent) => {
  const items = getTreeItems({ ordered: true })
  const firstSelectedItem = items.find(item => item.el.hasAttribute("data-selected"))
  if (firstSelectedItem) {
    firstSelectedItem.el.focus()
  } else {
    items[0]?.el.focus()
  }
}

provide(TreeRootContext, {
  expandedKeys,
  selectedKeys,
})
const getTreeItems = provideCollection()
</script>

<template>
  <el.div tabindex="-1" @keydown="handleKeydown" @mousedown="handleMouseDown" @focus="handleFocus">
    <slot :flattenItems="new TreeIterator<Item>(items, iteratorOptions)" :expandedKeys />
  </el.div>
</template>
