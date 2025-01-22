<script lang="ts">
const HistoryUpdateDelay = 1000
const MaxHistoryLength = 200
</script>

<script setup lang="ts">
import { useComposerContext } from "#components"
import { registerHistory, HistoryState } from "@lexical/history"
import { mergeRegister } from "@lexical/utils"
import {
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
} from "lexical"
import { onUnmounted, shallowReactive, watch } from "vue"

const { editor } = useComposerContext()

const historyState: HistoryState = {
  current: null,
  redoStack: [],
  undoStack: shallowReactive([]),
}

watch(
  () => historyState.undoStack.length,
  length => {
    if (length > MaxHistoryLength) {
      window.queueMicrotask(() => {
        historyState.undoStack.shift()
      })
    }
  },
  { flush: "post" },
)

function clearHistory() {
  historyState.current = null
  historyState.undoStack.length = 0
  historyState.redoStack.length = 0
}

onUnmounted(
  mergeRegister(
    registerHistory(editor, historyState, HistoryUpdateDelay),
    editor.registerCommand(
      CLEAR_HISTORY_COMMAND,
      () => {
        clearHistory()
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CLEAR_EDITOR_COMMAND,
      () => {
        clearHistory()
        return false
      },
      COMMAND_PRIORITY_NORMAL,
    ),
  ),
)
</script>

<template></template>
