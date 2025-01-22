<script lang="ts">
export const CheckboxClickableAreaWidth = 24
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import SlashMenu, { SlashMenuPluginApi } from "#plugins/SlashMenu"
import { getNodeKeyFromDOMNode, registerNodeElementMutationListener } from "#shared/node.ts"
import { ListItemNode } from "./nodes"
import { registerList } from "./registerList"
import { mergeRegister } from "@lexical/utils"
import { $getNodeByKey } from "lexical"
import { onUnmounted } from "vue"
import { slashMenuItems } from "./slashMenuItems"
import InputRule, { InputRulePluginApi } from "#plugins/InputRule"
import { inputRules } from "./inputRules"

const { editor } = useComposerContext()
const { registerPluginMountedHook } = usePluginsHostContext()
const cleanupFns = new Map<any, () => void>()

const handlePointeDown = (event: PointerEvent) => {
  const target = event.target as HTMLElement
  if (target === event.currentTarget) {
    if (event.clientX < target.getBoundingClientRect().left + CheckboxClickableAreaWidth) {
      event.preventDefault()
      event.stopPropagation()
      const nodeKey = getNodeKeyFromDOMNode(target, editor)!

      const handlePointerUp = () => {
        const node = editor.read(() => $getNodeByKey<ListItemNode>(nodeKey))!
        editor.update(() => {
          node.setChecked(!node.__checked)
        })
      }
      target.addEventListener("pointerup", handlePointerUp, { once: true })
    }
  }
}

onUnmounted(
  mergeRegister(
    registerList(editor),
    registerPluginMountedHook<SlashMenuPluginApi>(SlashMenu.id, plugin => {
      const unregister = plugin.registerItems(...slashMenuItems)
      cleanupFns.set(SlashMenu.id, unregister)
    }),
    registerPluginMountedHook<InputRulePluginApi>(InputRule.id, plugin => {
      const unregister = plugin.registerInputRules(...inputRules)
      cleanupFns.set(InputRule.id, unregister)
    }),
    registerNodeElementMutationListener(editor, ListItemNode, mutation => {
      if (mutation.type === "created") {
        const nodeKey = mutation.nodeKey
        const node = editor.read(() => $getNodeByKey<ListItemNode>(nodeKey))!
        if (node.__checked !== undefined) {
          const elem = editor.getElementByKey(nodeKey)!
          elem.addEventListener("pointerdown", handlePointeDown)
          cleanupFns.set(nodeKey, () => {
            elem.removeEventListener("pointerdown", handlePointeDown)
          })
        }
      } /* mutation.type === "destroyed" */ else {
        const cleanup = cleanupFns.get(mutation.nodeKey)
        if (cleanup) {
          cleanup()
          cleanupFns.delete(mutation.nodeKey)
        }
      }
    }),
    () => {
      cleanupFns.forEach(fn => fn())
    },
  ),
)
</script>

<template />
