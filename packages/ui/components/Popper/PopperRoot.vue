<script lang="ts">
interface PopperRootContextValue {
  anchor: Ref<Measurable | null>
}

export interface Measurable {
  // see https://floating-ui.com/docs/virtual-elements#usage
  getBoundingClientRect: () => DOMRect
}

export const PopperRootContext = Symbol('PopperRootContext') as InjectionKey<PopperRootContextValue>
</script>

<script setup lang="ts">
import { provide, ref, type InjectionKey, type Ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const anchor = ref<Measurable | null>(null)

provide(PopperRootContext, { anchor })
</script>

<template>
  <slot />
</template>
