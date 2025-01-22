<script lang="ts">
export interface AutoCompleteItemProps<Item> {
  value: Item
}

interface AutoCompleteItemEmits {
  accept: []
}
</script>

<script setup lang="ts" generic="Item">
import { computed, inject, ref, useId, type ComputedRef } from "vue"
import el from "../shared/polymorphic"
import {
    AutoCompleteContextValue,
    AutoCompleteContext,
    useAutoCompleteItemCollect,
} from "./AutoCompleteRoot.vue"
import { AutoCompleteGroupContext } from "./AutoCompleteGroup.vue"
import { useForwardRef } from "../shared/useForwardRef"

const { value: itemValue } = defineProps<AutoCompleteItemProps<Item>>()
const emit = defineEmits<AutoCompleteItemEmits>()

const { selectedId, input, matcher } =
  inject<AutoCompleteContextValue<Item>>(AutoCompleteContext)!
const groupId = inject(AutoCompleteGroupContext, { groupId: undefined }).groupId

const itemId = useId()
const itemRef = ref<HTMLElement | null>(null)
const [_, forwardRef] = useForwardRef(itemRef)

const render: ComputedRef<boolean> = computed(() => +matcher(itemValue, input.value) > 0)
const selected = computed(() => selectedId.value === itemId)
const itemData = computed(() => ({
  id: itemId,
  render: render.value,
  value: itemValue,
  groupId,
  accept,
}))

useAutoCompleteItemCollect(itemRef, itemData)

const accept = () => {
  emit("accept")
}
</script>

<template>
  <el.div :ref="forwardRef" v-show="render" :data-selected="selected || undefined" @click="accept">
    <slot />
  </el.div>
</template>
