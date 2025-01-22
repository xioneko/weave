<script lang="ts">
export interface MenuSubProps {
  open?: boolean
}

interface MenuSubEmits {
  "update:open": [open: boolean]
}

interface MenuSubContextValue {
  closeTimer: Ref<number | undefined>
  openTimer: Ref<number | undefined>
  triggerRef: Ref<HTMLElement | null>
  isTriggeredByKeyboard: Ref<boolean>
}

export const MenuSubContext = Symbol("MenuSubContext") as InjectionKey<MenuSubContextValue>
</script>

<script setup lang="ts">
import { PopperRoot } from "../Popper"
import { useControllableModel } from "../shared/useControllableModel"
import { MenuContext } from "./MenuRoot.vue"
import {
  computed,
  inject,
  provide,
  ref,
  useId,
  watchSyncEffect,
  type InjectionKey,
  type Ref,
} from "vue"

const { open: openProp = undefined } = defineProps<MenuSubProps>()
const emit = defineEmits<MenuSubEmits>()
defineOptions({
  inheritAttrs: false,
})

const { open: parentOpen, openedSubId, hierarchy } = inject(MenuContext)!

const childOpenedSubId = ref<string | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const closeTimer = ref<number | undefined>(undefined)
const openTimer = ref<number | undefined>(undefined)
const isTriggeredByKeyboard = ref(false)

const subId = useId()

const open = useControllableModel({
  value: () => openProp,
  defaultValue: false,
  onChange: open => emit("update:open", open),
})

watchSyncEffect(() => {
  open.value = parentOpen.value && openedSubId.value === subId
})

const setSubOpen = (open: boolean) => {
  if (open) {
    openedSubId.value = subId
  } else {
    // dealing with the case where another sub is opened almost at the same time
    if (openedSubId.value === subId) openedSubId.value = null
  }
}

provide(MenuContext, {
  open: computed({
    get: () => open.value,
    set: open => setSubOpen(open),
  }),
  openedSubId: childOpenedSubId,
  hierarchy: `${hierarchy}-${subId}`,
})
provide(MenuSubContext, { triggerRef, closeTimer, openTimer, isTriggeredByKeyboard })
</script>

<template>
  <PopperRoot>
    <slot />
  </PopperRoot>
</template>
