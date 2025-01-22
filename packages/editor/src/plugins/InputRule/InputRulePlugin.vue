<script lang="ts">
export interface InputRulePluginApi {
  registerInputRules: (...rules: InputRule[]) => () => void
}

const MaxTagMatchLength = 512
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import { UpdateTags } from "#core/constants.ts"
import { mergeRegister } from "@lexical/utils"
import { $createTextNode, $getSelection, $isRangeSelection, TextNode, TextPoint } from "lexical"
import { onUnmounted, shallowRef } from "vue"
import { InputRule } from "./InputRule"

const { editor } = useComposerContext()

const formatRules = shallowRef<(InputRule & { type: "format" })[]>([])
const nodeRules = shallowRef<(InputRule & { type: "node" })[]>([])

onUnmounted(
  mergeRegister(
    editor.registerUpdateListener(({ tags, prevEditorState }) => {
      editor.read(() => {
        if (editor.isComposing() || tags.has(UpdateTags.historic)) return
        const selection = $getSelection()
        if (
          $isRangeSelection(selection) &&
          selection.isCollapsed() &&
          selection.anchor.type === "text"
        ) {
          const node = selection.anchor.getNode()
          const prevNode = prevEditorState._nodeMap.get(node.__key) as TextNode | undefined
          if (node.isSimpleText() && (!prevNode || node.__text.length > prevNode.__text.length)) {
            tryTransform(node.__text, node, selection.anchor as TextPoint)
          }
        }
      })
    }),
  ),
)

function tryTransform(text: string, node: TextNode, cursor: TextPoint) {
  const nodeRulesValue = nodeRules.value
  for (let i = 0; i < nodeRulesValue.length; ++i) {
    const rule = nodeRulesValue[i]
    if (rule.transform(node, cursor.offset, editor) !== false) {
      return
    }
  }

  const startOffset = cursor.offset > MaxTagMatchLength ? cursor.offset - MaxTagMatchLength : 0
  const textBefore = text.slice(startOffset, cursor.offset)

  const formatRulesValue = formatRules.value
  for (let i = 0; i < formatRulesValue.length; ++i) {
    const rule = formatRulesValue[i]
    let suffix = rule.tag
    if (rule.spaceAfter) suffix += " "
    if (textBefore.endsWith(suffix)) {
      const closeTagStart = textBefore.length - suffix.length
      if (closeTagStart > 0 && textBefore[closeTagStart - 1] !== " ") {
        const openTagStart = textBefore.lastIndexOf(rule.tag, closeTagStart - 1)
        if (openTagStart !== -1) {
          const openTagEnd = openTagStart + rule.tag.length
          if (openTagEnd < closeTagStart && textBefore[openTagEnd] !== " ") {
            const closeTagEnd = cursor.offset
            editor.update(() => {
              const textBetween = textBefore.slice(openTagEnd, closeTagStart)
              const newTextNode = $createTextNode(textBetween)
              newTextNode.setFormat(rule.format)
              const textNodes = node.splitText(
                startOffset + openTagStart,
                startOffset + closeTagEnd,
              )
              if (openTagStart === 0) {
                textNodes[0].replace(newTextNode)
              } else {
                textNodes[1].replace(newTextNode)
              }
            })
            return
          }
        }
      }
    }
  }
}

function insert(rules: InputRule[], rule: InputRule) {
  const index = rules.findIndex(r => (r.priority ?? 0) <= (rule.priority ?? 0))
  if (index === -1) {
    rules.push(rule)
  } else {
    rules.splice(index, 0, rule)
  }
}

function remove(rules: InputRule[], rule: InputRule) {
  const index = rules.indexOf(rule)
  if (index !== -1) {
    rules.splice(index, 1)
  }
}

defineExpose<InputRulePluginApi>({
  registerInputRules(...rules: InputRule[]) {
    rules.forEach(rule => {
      switch (rule.type) {
        case "format":
          insert(formatRules.value, rule)
          break
        case "node":
          insert(nodeRules.value, rule)
          break
      }
    })
    return () => {
      rules.forEach(rule => {
        switch (rule.type) {
          case "format":
            remove(formatRules.value, rule)
            break
          case "node":
            remove(nodeRules.value, rule)
            break
        }
      })
    }
  },
})
</script>

<template></template>
