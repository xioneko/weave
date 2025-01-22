<script lang="ts">
export interface HorizontalRuleDecoratorProps {
  nodeKey: NodeKey
}
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import { SELECT_BLOCK_COMMAND } from "#core/nodes"
import { $getNodeByKey, NodeKey } from "lexical"
import { onMounted } from "vue"
import { HorizontalRuleNode } from "../nodes/HorizontalRuleNode"
const { nodeKey } = defineProps<HorizontalRuleDecoratorProps>()
const { editor } = useComposerContext()

onMounted(() => {
  const dom = editor.getElementByKey(nodeKey)!
  dom.addEventListener("click", () => {
    const node = editor.read(() => $getNodeByKey<HorizontalRuleNode>(nodeKey))
    if (node) editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node })
  })
})
</script>

<template></template>
