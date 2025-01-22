<script lang="ts">
export type EnterTransition = (el: HTMLElement) => void
export type ExitTransition = (el: HTMLElement, done: () => void) => void

interface PopperTransitionEmits {
  enter: Parameters<EnterTransition>
  leave: Parameters<ExitTransition>
}

interface PopperTransitionContextValue {
  onEnter: EnterTransition
}

export const PopperTransitionContext = Symbol(
  "PopperTransitionContext",
) as InjectionKey<PopperTransitionContextValue>
</script>

<script setup lang="ts">
import { InjectionKey, provide } from "vue"

const emit = defineEmits<PopperTransitionEmits>()

let popperContent: HTMLElement

const onEnter = (popper: HTMLElement) => {
  popperContent = popper
  emit("enter", popper)
}

provide(PopperTransitionContext, {
  onEnter,
})
</script>

<template>
  <Transition
    :css="false"
    @leave="
      (_el, done) => {
        // `_el` is the PopperContent Wrapper, and should not be applied transform transition
        if (popperContent) {
          emit('leave', popperContent, done)
        }
      }
    "
  >
    <slot />
  </Transition>
</template>
