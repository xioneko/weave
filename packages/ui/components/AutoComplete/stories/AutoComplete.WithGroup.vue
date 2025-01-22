<script setup lang="ts">
import * as AutoComplete from ".."
import * as styles from "./AutoComplete.story.css"
import { getNames } from "./mock"
import { ref } from "vue"

const Items = getNames(100)
const value = ref("")
const handleAccept = (item: string) => {
  value.value = item
}
</script>

<template>
  <AutoComplete.Root v-model="value" :matcher="AutoComplete.prefixMatcher" sorted>
    <AutoComplete.Input :class="styles.input" placeholder="Enter some text..." />
    <AutoComplete.Content :class="styles.content">
      <AutoComplete.Group
        :class="styles.group"
        v-for="[letter, items] of Map.groupBy(Items, x => x[0].toUpperCase())"
        :key="letter"
      >
        <div :class="styles.label">{{ letter }}</div>
        <AutoComplete.Item
          :class="styles.item"
          v-for="item of items"
          :key="item"
          :value="item"
          @accept="handleAccept(item)"
        >
          {{ item }}
        </AutoComplete.Item>
      </AutoComplete.Group>
    </AutoComplete.Content>
  </AutoComplete.Root>
</template>
