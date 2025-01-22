<script setup lang="ts">
import { useComposerContext } from "./EditorComposer.vue"
import { useEditable } from "./shared/useEditable"
import { $createParagraphNode, $getRoot, $isElementNode } from "lexical"
import { useTemplateRef, onMounted, onScopeDispose } from "vue"

const { editor } = useComposerContext()

const rootRef = useTemplateRef("rootKey")
const isEditable = useEditable(editor)

const handlePointerDown = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    const lastChild = rootRef.value!.lastElementChild
    if (lastChild) {
      const rect = lastChild.getBoundingClientRect()
      if (event.clientY < rect.bottom) return
    }
    editor.read(() => {
      const root = $getRoot()
      const lastChild = root.getLastChild()
      if ($isElementNode(lastChild) && lastChild.isEmpty()) {
        return
      }
      editor.update(() => {
        const paragraph = $createParagraphNode()
        root.append(paragraph)
      })
    })
  }
}

onMounted(() => {
  const rootElement = rootRef.value!
  editor.setRootElement(rootElement)
  rootElement.addEventListener("pointerdown", handlePointerDown)
  onScopeDispose(() => {
    editor.setRootElement(null)
    rootElement.removeEventListener("pointerdown", handlePointerDown)
  })
})
</script>

<template>
  <div :contenteditable="isEditable" ref="rootKey" />
</template>
