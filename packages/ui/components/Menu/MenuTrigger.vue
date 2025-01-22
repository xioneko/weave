<script setup lang="ts">
import { PopperAnchor } from "#components/Popper"
import { useForwardRef } from "../shared/useForwardRef"
import { MenuContext, MenuRootContext } from "./MenuRoot.vue"
import { inject } from "vue"

const { triggerRef } = inject(MenuRootContext)!
const { open } = inject(MenuContext)!

const [_, forwardRef] = useForwardRef(triggerRef)
</script>

<template>
  <PopperAnchor :ref="forwardRef" tabindex="-1" @click="open = !open">
    <slot />
  </PopperAnchor>
</template>
