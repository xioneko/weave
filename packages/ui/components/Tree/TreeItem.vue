<script lang="ts">
export interface TreeItemProps<Item> {
  value: TreeIteratorValue<Item>
  itemKey: PropertyKey
  level: number
}

interface TreeItemSlots {
  default: (props: { expanded: boolean; selected: boolean; collapsed: boolean }) => any
}
</script>

<script setup lang="ts" generic="Item extends Record<string, any>">
import { computed, inject, ref } from 'vue'
import el from '../shared/polymorphic'
import { TreeRootContext, useTreeItemCollect, type TreeItemData } from './TreeRoot.vue'
import { useForwardRef } from '../shared/useForwardRef'
import type { TreeIteratorValue } from './TreeIterator'

const { value, level, itemKey } = defineProps<TreeItemProps<Item>>()

defineSlots<TreeItemSlots>()

const { expandedKeys, selectedKeys } = inject(TreeRootContext)!

const [itemRef, forwardRef] = useForwardRef()
const focused = ref(false)

const expanded = computed(() => expandedKeys.value.has(itemKey))
const selected = computed(() => selectedKeys.value.has(itemKey))

const itemData = computed<TreeItemData>(() => ({
  item: value,
}))

useTreeItemCollect(itemRef, itemData)

const handleFocus = () => (focused.value = true)
const handleBlur = () => (focused.value = false)
</script>

<template>
  <el.div
    :data-selected="selected || undefined"
    :data-expanded="expanded || undefined"
    :data-collapsed="value.skipChildren || undefined"
    :data-level="level"
    :ref="forwardRef"
    :tabindex="focused ? 0 : -1"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot :expanded :selected :collapsed="!!value.skipChildren" />
  </el.div>
</template>
