<script lang="ts">
export type OpenContextMenuCommandPayload = {
  items: ContextMenuItem[]
  event: MouseEvent
}
export const OPEN_CONTEXT_MENU_COMMAND: LexicalCommand<OpenContextMenuCommandPayload> =
  createCommand("OPEN_CONTEXT_MENU_COMMAND")
</script>

<script setup lang="ts">
import { useComposerContext, getViewportElement } from "#components"
import * as css from "./ContextMenu.css"
import { ContextMenuItem, getDefaultContextMenuItems } from "./ContextMenuItem"
import ContextMenuItems from "./ContextMenuItems.vue"
import { mergeRegister } from "@lexical/utils"
import * as Menu from "@weave/ui/components/Menu"
import { $getSelection, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from "lexical"
import { onMounted, onScopeDispose, onUnmounted, Ref, ref, watch } from "vue"

const { editor } = useComposerContext()

const open = ref(false)
let viewportElement: HTMLElement
let virtualAnchor: Ref<Menu.Measurable | null> = ref(null)
let menuItems: ContextMenuItem[] = []

const defaultItems = getDefaultContextMenuItems()

watch(open, isOpen => {
  if (isOpen) {
    if (viewportElement) {
      viewportElement.addEventListener(
        "scroll",
        () => {
          open.value = false
        },
        { once: true },
      )
    }
  }
})

const handleContextMenu = (event: MouseEvent) => {
  const items: ContextMenuItem[] = defaultItems.slice()
  if (editor.dispatchCommand(OPEN_CONTEXT_MENU_COMMAND, { items, event })) {
    event.preventDefault()
    menuItems = items
    virtualAnchor.value = {
      getBoundingClientRect: () =>
        DOMRect.fromRect({
          x: event.clientX,
          y: event.clientY,
        }),
    }
    open.value = true
  }
}

onMounted(() => {
  const rootElement = editor.getRootElement()!
  viewportElement = getViewportElement(rootElement)
  rootElement.addEventListener("contextmenu", handleContextMenu)
  onScopeDispose(() => {
    rootElement.removeEventListener("contextmenu", handleContextMenu)
  })
})

onUnmounted(
  mergeRegister(
    editor.registerCommand(
      OPEN_CONTEXT_MENU_COMMAND,
      () => {
        const selection = $getSelection()
        return selection !== null
      },
      COMMAND_PRIORITY_EDITOR,
    ),
  ),
)
</script>

<template>
  <Menu.Root v-model:open="open">
    <Menu.Anchor :virtual-element="virtualAnchor" />
    <Teleport to="body">
      <Menu.Transition @enter="Menu.fadeIn" @leave="Menu.fadeOut">
        <Menu.Content
          :class="['ContextMenu__content', css.content]"
          strategy="fixed"
          side="right"
          :side-offset="2"
          align="start"
          :collision-padding="4"
          @positioned="$event.focus()"
        >
          <ContextMenuItems :items="menuItems" />
        </Menu.Content>
      </Menu.Transition>
    </Teleport>
  </Menu.Root>
</template>
