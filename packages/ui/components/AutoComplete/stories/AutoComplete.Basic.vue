<script setup lang="ts">
import * as AutoComplete from ".."
import { vFocus } from "../../shared/vFocus"
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
  <AutoComplete.Root v-model="value" :matcher="AutoComplete.weightedSubsequenceMatcher" sorted>
    <AutoComplete.Input :class="styles.input" placeholder="Enter some text..." v-focus="true" />
    <AutoComplete.Content :class="styles.content">
      <AutoComplete.Item
        v-for="item of Items"
        :class="styles.item"
        :value="item"
        :key="item"
        @accept="handleAccept(item)"
      >
        {{ item }}
      </AutoComplete.Item>
    </AutoComplete.Content>
  </AutoComplete.Root>
</template>
