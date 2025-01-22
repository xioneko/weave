<script lang="ts">
export interface AutoCompleteRootProps<Item> {
  sorted?: boolean
  matcher: AutoCompleteMatcher<Item>
}

type AutoCompleteItemData<Item> = {
  id: string
  value: Item
  render: boolean
  groupId?: string
  accept: () => void
}

export interface AutoCompleteContextValue<Item> {
  input: Ref<string>
  selectedId: Ref<string | null>
  sorted: boolean
  matcher: AutoCompleteMatcher<Item>
}

export const AutoCompleteContext = Symbol("AutoCompleteContext") as InjectionKey<
  AutoCompleteContextValue<unknown>
>

export const {
  provideCollection,
  injectCollection,
  useCollect: useAutoCompleteItemCollect,
} = createCollection<AutoCompleteItemData<unknown>>()
</script>

<script lang="ts" setup generic="Item">
import { provide, ref, type InjectionKey, type Ref } from "vue"
import { createCollection } from "../shared/createCollection"
import { AutoCompleteMatcher } from "./AutoCompleteMatcher"

const { sorted, matcher } = defineProps<AutoCompleteRootProps<Item>>()
const inputModel = defineModel<string>({
  required: true,
})

const selectedId = ref<string | null>(null)

provide(AutoCompleteContext as InjectionKey<AutoCompleteContextValue<Item>>, {
  input: inputModel,
  selectedId,
  matcher,
  sorted,
})

provideCollection()
</script>

<template>
  <slot />
</template>
