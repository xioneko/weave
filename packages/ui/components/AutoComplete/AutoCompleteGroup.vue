<script lang="ts">
export interface AutoCompleteGroupProps {
  asChild?: boolean
}

export const AutoCompleteGroupContext = Symbol('AutoCompleteGroup') as InjectionKey<{
  groupId?: string
}>
</script>

<script setup lang="ts">
import { provide, useId, type InjectionKey } from 'vue'
import el from '../shared/polymorphic'

const props = defineProps<AutoCompleteGroupProps>()

const groupId = useId()

provide(AutoCompleteGroupContext, {
  groupId,
})
</script>

<template>
  <el.div data-autocomplete-group :as-child="props.asChild" ref="group">
    <slot />
  </el.div>
</template>
