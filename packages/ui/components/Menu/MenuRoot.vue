<script lang="ts">
interface MenuRootContextValue {
  modal: boolean
  triggerRef: Ref<HTMLElement | null>
}

interface MenuContextValue {
  open: Ref<boolean>
  openedSubId: Ref<string | null>
  hierarchy: string
}

export interface MenuRootProps {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
}

interface MenuEmits {
  "update:open": [open: boolean]
}

export const MenuRootContext = Symbol("MenuRootContext") as InjectionKey<MenuRootContextValue>
export const MenuContext = Symbol("MenuContext") as InjectionKey<MenuContextValue>
</script>

<script setup lang="ts">
import { PopperRoot } from "../Popper"
import { provide, ref, useId, type InjectionKey, type Ref } from "vue"
import { useControllableModel } from "../shared/useControllableModel"

const {
  modal = false,
  defaultOpen = false,
  open: openProp = undefined,
} = defineProps<MenuRootProps>()

const emit = defineEmits<MenuEmits>()

defineOptions({
  inheritAttrs: false,
})

const open = useControllableModel({
  value: () => openProp,
  defaultValue: defaultOpen,
  onChange: value => {
    emit("update:open", value)
  },
})

const openedSubId = ref<string | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const rootId = useId()
const hierarchy = rootId

provide(MenuRootContext, { modal, triggerRef })
provide(MenuContext, { open, openedSubId, hierarchy })
</script>

<template>
  <PopperRoot>
    <slot />
  </PopperRoot>
</template>
