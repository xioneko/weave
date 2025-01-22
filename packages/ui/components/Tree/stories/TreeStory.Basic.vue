<script setup lang="ts">
import { ref } from 'vue'
import * as Tree from '..'
import { generateTree } from './mock'
import type { TreeIteratorValue } from '../TreeIterator'
const tree = generateTree(5, 3)
const expandedKeys = ref(new Set<PropertyKey>())
const selectedKeys = ref(new Set<PropertyKey>())

const handleExpand = (item: TreeIteratorValue<typeof tree>) => {
  if (expandedKeys.value.has(item.itemKey)) {
    expandedKeys.value.delete(item.itemKey)
  } else {
    expandedKeys.value.add(item.itemKey)
  }
}
</script>

<template>
  <Tree.Root
    class="Tree__root"
    :items="tree"
    v-slot="{ flattenItems }"
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    multiple
  >
    <Tree.Item
      class="Tree__item"
      v-for="item of flattenItems"
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
        @click="() => handleExpand(item)"
        :style="{
          transform: `rotate(${item.skipChildren ? 90 : 180}deg)`,
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
    </Tree.Item>
  </Tree.Root>
</template>

<style lang="css">
.Tree__root {
  display: flex;
  flex-direction: column;
}

.Tree__item {
  position: relative;
  user-select: none;
  cursor: pointer;
  display: flex;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    background-color: rgba(0, 0, 0, 0.1);
    outline: rgba(119, 136, 153, 0.3) solid 1px;
  }

  &[data-selected] {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.Tree__item-indent {
  opacity: 0;
  transition: opacity 0.2s;
  .Tree__root:hover & {
    opacity: 0.8;
  }
}

.Tree__item-content {
  padding: 2px 0;
}
</style>
