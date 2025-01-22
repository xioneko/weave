<script lang="ts">
export interface EditorTreeViewProps {
  editor: LexicalEditor
  debounce?: number
  maxCommandLogLength?: number
  exportDOM?: boolean
}
</script>

<script setup lang="ts">
import { mergeRegister } from "@lexical/utils"
import { COMMAND_PRIORITY_CRITICAL, LexicalEditor } from "lexical"
import { onMounted, onScopeDispose, ref } from "vue"
import { generateContent, type LexicalCommandLog } from "@lexical/devtools-core"
import type { Writable } from "type-fest"
import { debounce } from "#shared/utils.ts"

const {
  editor,
  debounce: debounceMs = 0,
  maxCommandLogLength = 10,
  exportDOM,
} = defineProps<EditorTreeViewProps>()

const commandsLog: Writable<LexicalCommandLog> = []
let commandIndex = 0

const content = ref(generateContent(editor, commandsLog, exportDOM))

function _updateContent() {
  content.value = generateContent(editor, commandsLog, exportDOM)
}

const updateContent = debounce(_updateContent, debounceMs)

onMounted(() => {
  // It's not guaranteed that all commands are registered before the EditorTreeView is mounted.
  onScopeDispose(
    mergeRegister(
      editor.registerUpdateListener(updateContent),
      ...Array.from(
        Array.from(editor._commands.keys()).map(command =>
          editor.registerCommand(
            command,
            payload => {
              commandsLog.push({
                type: command.type ?? "UNKNOWN",
                payload,
                index: commandIndex++,
              })
              if (commandsLog.length > maxCommandLogLength) {
                commandsLog.shift()
              }
              return false
            },
            COMMAND_PRIORITY_CRITICAL,
          ),
        ),
      ),
    ),
  )
})
</script>

<template>
  <pre>{{ content }}</pre>
</template>
