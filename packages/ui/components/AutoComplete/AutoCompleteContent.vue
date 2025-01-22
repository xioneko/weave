<script lang="ts">
export interface AutoCompleteContentEmits {
  noMatch: []
}

function filterItems<Item, T extends { data: { render: boolean; value: Item } }>(
  items: T[],
  input: string,
  matcher: AutoCompleteMatcher<Item>,
  sorted: boolean,
): T[] {
  if (input === "") return items
  const filtered: [T, weight: number][] = []
  items.forEach(item => {
    if (!item.data.render) return
    const weight = +matcher(item.data.value, input)
    if (weight > 0) {
      filtered.push([item, weight])
    }
  })
  if (sorted) filtered.sort((a, b) => b[1] - a[1])
  return filtered.map(([item]) => item)
}
</script>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue"
import { AutoCompleteContext, injectCollection } from "./AutoCompleteRoot.vue"
import el from "../shared/polymorphic"
import { AutoCompleteMatcher } from "./AutoCompleteMatcher"
import { useForwardRef } from "../shared/useForwardRef"

const emit = defineEmits<AutoCompleteContentEmits>()

const { input, selectedId, matcher, sorted } = inject(AutoCompleteContext)!
const getItems = injectCollection()

const [contentRef, forwardRef] = useForwardRef()
const empty = ref(false)

onMounted(() => {
  // To ensure all the items elements are mounted
  watch(
    input,
    () => {
      const inputValue = input.value
      const items = getItems({ ordered: true, cached: !sorted })
      const itemGroups = Array.from(
        Map.groupBy(items, item => item.data.groupId ?? "default").values(),
      )
      let firstItem: ReturnType<typeof getItems>[0] | null = null
      itemGroups.forEach(items => {
        const groupEl = items[0].el.closest("[data-autocomplete-group]")
        const filteredItems = filterItems(items, inputValue, matcher, sorted)
        if (filteredItems.length > 0) {
          if (firstItem === null) {
            // When input changes, select the first item
            firstItem = filteredItems[0]
            selectedId.value = firstItem.data.id
            empty.value = false
            ;(groupEl ?? firstItem.el).scrollIntoView({ block: "nearest" })
          }
          if (groupEl) {
            ;(groupEl as HTMLElement).style.display = ""
            // reordering the items in the group
            if (sorted) groupEl.append(...filteredItems.map(item => item.el))
          } else if (sorted) {
            // if the items are not grouped, append them to the contentRef directly
            contentRef.value!.append(...filteredItems.map(item => item.el))
          }
        } else if (groupEl) {
          // Hide the group if no items are rendered
          ;(groupEl as HTMLElement).style.display = "none"
        }
      })
      if (!firstItem) {
        // If no items are rendered, emit noMatch event
        emit("noMatch")
        empty.value = true
        selectedId.value = null
      }
    },
    {
      immediate: true,
      flush: "post", // to ensure the items data is updated after the input value change
    },
  )
})
</script>

<template>
  <el.div :data-empty="empty || undefined" :ref="forwardRef">
    <slot />
  </el.div>
</template>
