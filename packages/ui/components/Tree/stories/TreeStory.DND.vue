<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import TreeDraggableItem from './_TreeDraggableItem.vue'
import { TreeRoot } from '..'
import { generateTree } from './mock'
import type { TreeIteratorValue } from '../TreeIterator'
import { TreeStore } from '../TreeStore'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item'
const tree = reactive(generateTree(5, 3))
const treeStore = new TreeStore(tree)
const expandedKeys = ref(new Set<PropertyKey>())
const selectedKeys = ref(new Set<PropertyKey>())

const setExpansion = (item: TreeIteratorValue<typeof tree>, expanded: boolean) => {
  if (expanded) {
    expandedKeys.value.add(item.itemKey)
  } else {
    expandedKeys.value.delete(item.itemKey)
  }
}

watchEffect((onCleanup) => {
  onCleanup(
    monitorForElements({
      onDrop({ location, source }) {
        if (!location.current.dropTargets.length) return
        const sourceItem = source.data.value as typeof tree
        const sourceKey = source.data.itemKey as PropertyKey
        const targetKey = location.current.dropTargets[0].data.itemKey as PropertyKey
        const instruction = extractInstruction(location.current.dropTargets[0].data)
        console.log('DND', sourceItem, sourceKey, targetKey, instruction)

        switch (instruction?.type) {
          case 'reparent': {
            const path = treeStore.getPathToItem(sourceKey)
            const desiredParentKey = path[instruction.desiredLevel]
            if (desiredParentKey) {
              treeStore.moveItem(sourceKey, desiredParentKey, 'child')
            }
            break
          }
          case 'reorder-above': {
            treeStore.moveItem(sourceKey, targetKey, 'before')
            break
          }
          case 'reorder-below': {
            treeStore.moveItem(sourceKey, targetKey, 'after')
            break
          }
          case 'make-child': {
            treeStore.moveItem(sourceKey, targetKey, 'child')
            break
          }
        }
      },
    }),
  )
})
</script>

<template>
  <TreeRoot
    class="Tree__root"
    :items="tree"
    v-slot="{ flattenItems }"
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    multiple
  >
    <TreeDraggableItem
      class="Tree__item"
      v-for="item of flattenItems"
      v-slot="{ expanded, collapsed }"
      :key="item.itemKey"
      :value="item"
      :level="item.level"
      :item-key="item.itemKey"
    >
      <div
        class="Tree__item-indent"
        :style="{
          display: 'flex',
        }"
      >
        <div
          v-for="i in item.level"
          :style="{
            width: '10px',
            borderRight: '1px solid rgba(0 0 0 / 0.2)',
          }"
        />
      </div>
      <div
        class="Tree__item-collapsible"
        @click="() => setExpansion(item, !expanded)"
        :style="{
          transform: `rotate(${collapsed ? 90 : 180}deg)`,
          display: 'grid',
          visibility: item.children.length === 0 ? 'hidden' : 'visible',
          placeContent: 'center',
          width: '20px',
          color: 'gray',
        }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="m17 14l-5-5l-5 5"
          />
        </svg>
      </div>
      <div class="Tree__item-content">{{ item.value.fileName }}</div>
    </TreeDraggableItem>
  </TreeRoot>
</template>

<style lang="css"></style>
