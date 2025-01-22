<script lang="ts">
export interface EditorComposerContextValue {
  editor: LexicalEditor
  theme: EditorThemeClasses
  config: Record<string, unknown>
  converter: EditorStateConverter
}

export interface EditorComposerProps {
  theme?: EditorThemeClasses
  editable?: boolean
  initialEditorState?: string | EditorState
  namespace?: string
  plugins?: EditorPlugin[]
  userConfig?: Record<string, unknown>
}

interface EditorComposerEmits {
  error: [error: Error]
}

interface EditorComposerExpose {
  editor: LexicalEditor
  converter: EditorStateConverter
}

export const EditorComposerContext = Symbol.for(
  "ComposerContext",
) as InjectionKey<EditorComposerContextValue>

export function useComposerContext() {
  const context = inject(EditorComposerContext)
  if (context === undefined) {
    throw new Error("useComposerContexts must be used within a EditorComposer")
  }
  return context
}

function initializeEditorState(
  editor: LexicalEditor,
  initialState: EditorComposerProps["initialEditorState"],
) {
  switch (typeof initialState) {
    case "string":
      const parsedEditorState = editor.parseEditorState(initialState)
      editor.setEditorState(parsedEditorState, { tag: UpdateTags.historyMerge })
      break
    case "object":
      editor.setEditorState(initialState, { tag: UpdateTags.historyMerge })
      break
    case "undefined":
      editor.update(
        () => {
          const root = $getRoot()
          if (root.isEmpty()) {
            const paragraph = $createParagraphNode()
            const activeElement = document.activeElement
            root.append(paragraph)
            if (
              $getSelection() !== null ||
              (activeElement !== null && activeElement === editor.getRootElement())
            ) {
              paragraph.select()
            }
          }
        },
        { tag: UpdateTags.historyMerge },
      )
      break
    default:
      throw new Error(
        `Initialize editor state failed: invalid initialEditorState type ${typeof initializeEditorState}`,
      )
  }
}
</script>

<script setup lang="ts">
import { UpdateTags } from "#core/constants.ts"
import { EditorStateConverter } from "#core/converter.ts"
import { ParagraphBlockNode, registerBlock } from "#core/nodes"
import { EditorPlugin, EditorThemeClasses } from "#core/types.ts"
import DecoratorTeleports from "./DecoratorTeleports"
import PluginsHost from "./PluginsHost.vue"
import { mergeRegister } from "@lexical/utils"
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  createEditor,
  EditorState,
  LexicalEditor,
  NodeKey,
  ParagraphNode,
} from "lexical"
import { Component, inject, InjectionKey, onUnmounted, provide, shallowRef } from "vue"

const {
  editable = true,
  initialEditorState,
  namespace,
  theme = {},
  plugins = [],
  userConfig = {},
} = defineProps<EditorComposerProps>()
const emit = defineEmits<EditorComposerEmits>()

const builtInNodes = [
  {
    replace: ParagraphNode,
    with: () => new ParagraphBlockNode(),
    withKlass: ParagraphBlockNode,
  },
  ParagraphBlockNode,
]

// TODO: Dynamically load or unload plugins

const editor = createEditor({
  nodes: plugins.flatMap(plugin => plugin.nodes ?? []).concat(builtInNodes),
  editable,
  namespace,
  theme,
  onError(error) {
    emit("error", error)
  },
})

initializeEditorState(editor, initialEditorState)

const decorators = shallowRef<Record<NodeKey, Component>>(editor.getDecorators())

const converter = new EditorStateConverter(editor, plugins)

onUnmounted(
  mergeRegister(
    editor.registerDecoratorListener(it => {
      decorators.value = it as Record<NodeKey, Component>
    }),
    registerBlock(editor),
  ),
)

provide(EditorComposerContext, { editor, theme, config: userConfig, converter })

defineExpose<EditorComposerExpose>({ editor, converter })
</script>

<template>
  <slot />
  <DecoratorTeleports :decorators />
  <PluginsHost :plugins="plugins" />
</template>
