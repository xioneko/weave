<script setup lang="ts">
import el from "../shared/polymorphic"
import { AutoCompleteContext, injectCollection } from "./AutoCompleteRoot.vue"
import { inject } from "vue"

const { input, selectedId } = inject(AutoCompleteContext)!
const getItems = injectCollection()

const handleKeydown = (event: KeyboardEvent) => {
  if (event.target !== event.currentTarget) return
  if (selectedId.value === null) return // No items in the list

  if (["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
    event.preventDefault()
    const items = getItems({ ordered: true }).filter(item => item.data.render)
    const index = items.findIndex(item => item.data.id === selectedId.value)

    // Press Enter to complete the input with the selected item value
    if (event.key === "Enter") {
      items[index].data.accept()
      return
    }

    // Press ArrowDown or ArrowUp to navigate the items
    const nextIndex = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
    }[event.key]!
    selectedId.value = items[nextIndex].data.id

    // Scroll the selected item into view
    const itemEl = items[nextIndex].el
    if (nextIndex == 0) {
      ;(itemEl.closest("[data-autocomplete-group]") ?? itemEl).scrollIntoView({
        block: "nearest",
      })
    } else {
      itemEl.scrollIntoView({ block: "nearest" })
    }
  }
}

const handleInput = (event: Event) => {
  input.value = (event.target as HTMLInputElement).value.trim()
}
</script>

<template>
  <el.input type="text" :value="input" @input="handleInput" @keydown="handleKeydown" />
</template>
