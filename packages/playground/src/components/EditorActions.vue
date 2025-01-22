<script setup lang="ts">
import { AppContext } from "../App.vue"
import { currentDateTime, exportFile, importTextFile } from "../utils"
import { useComposerContext } from "@weave/editor"
import { $getRoot, $createParagraphNode, $createRangeSelection, $setSelection } from "lexical"
import { inject } from "vue"

const { editor, converter } = useComposerContext()
const { showToast } = inject(AppContext)!

async function importFromJSON() {
  const json = await importTextFile("application/json")
  converter.fromJSON(json)
}

async function importFromMarkdown() {
  const markdown = await importTextFile("text/markdown")
  converter.fromMarkdown(markdown)
}

function exportAsJSON() {
  const data = converter.toJSON()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  exportFile(blob, `Weave Playground ${currentDateTime()}.json`)
}

function exportAsMarkdown() {
  const markdown = converter.toMarkdown()
  const blob = new Blob([markdown], { type: "text/markdown" })
  exportFile(blob, `Weave Playground ${currentDateTime()}.md`)
}

async function copyJSON() {
  const data = converter.toJSON()
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  showToast("Copied as JSON")
}

async function copyMarkdown() {
  const markdown = converter.toMarkdown()
  await navigator.clipboard.writeText(markdown)
  showToast("Copied as Markdown")
}

async function copyHTML() {
  const html = converter.toHTML()
  await navigator.clipboard.writeText(html)
  showToast("Copied as HTML")
}

function clearEditor() {
  editor.update(() => {
    const root = $getRoot()
    root.clear()
    const paragraph = $createParagraphNode()
    root.append(paragraph)
    const selection = $createRangeSelection()
    selection.anchor.set(paragraph.__key, 0, "element")
    selection.focus.set(paragraph.__key, 0, "element")
    $setSelection(selection)
  })
}

defineExpose({
  importFromJSON,
  importFromMarkdown,
  exportAsJSON,
  exportAsMarkdown,
  copyJSON,
  copyMarkdown,
  copyHTML,
  clearEditor,
})
</script>

<template></template>
