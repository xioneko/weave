<script setup lang="ts">
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import InputRule, { InputRulePluginApi } from "#plugins/InputRule"
import SlashMenu, { SlashMenuPluginApi } from "#plugins/SlashMenu"
import { $getBlockElementNodeAtPoint } from "#shared/selection.ts"
import { $createCodeBlockNode } from "./CodeBlockNode"
import { mergeRegister } from "@lexical/utils"
import { CodeBlock } from "@weave/ui/icons"
import { $isParagraphNode } from "lexical"
import { onUnmounted } from "vue"

const { registerPluginMountedHook } = usePluginsHostContext()
const cleanupFns: (() => void)[] = []

onUnmounted(
  mergeRegister(
    registerPluginMountedHook<SlashMenuPluginApi>(SlashMenu.id, plugin => {
      const unregister = plugin.registerItems({
        id: "code-block",
        title: "Code block",
        icon: CodeBlock,
        action(editor, selection) {
          editor.update(() => {
            const block = $getBlockElementNodeAtPoint(selection.anchor)
            if (block) {
              const codeBlock = $createCodeBlockNode()
              if (block.isEmpty() && $isParagraphNode(block)) {
                block.replace(codeBlock)
              } else {
                block.insertAfter(codeBlock)
              }
              codeBlock.selectStart()
            }
          })
        },
      })
      cleanupFns.push(unregister)
    }),
    registerPluginMountedHook<InputRulePluginApi>(InputRule.id, plugin => {
      const unregister = plugin.registerInputRules({
        type: "node",
        transform(node, offset, editor) {
          const block = node.getParent()
          if (!$isParagraphNode(block) || block.__first !== node.__key) return false
          const match = node.__text.match(/^```(\w+)? $/)
          if (!match) return false
          editor.update(() => {
            const codeBlock = $createCodeBlockNode(match[1])
            // If using `replace`, the selection will be lost
            block.insertAfter(codeBlock)
            block.remove()
            codeBlock.selectStart()
          })
        },
      })
      cleanupFns.push(unregister)
    }),
    () => cleanupFns.forEach(fn => fn()),
  ),
)
</script>

<template></template>
