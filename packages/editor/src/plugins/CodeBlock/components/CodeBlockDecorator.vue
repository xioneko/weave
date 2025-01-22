<script lang="ts">
export interface CodeBlockDecoratorProps {
  nodeKey: string
  code: string
  language?: string
}

interface CodeBlockDecoratorExpose {
  selectStart: () => void
  selectEnd: () => void
}
</script>

<script setup lang="ts">
import { onMounted, shallowRef, useTemplateRef, watch } from "vue"
import { EditorView, keymap, ViewUpdate } from "@codemirror/view"
import { useComposerContext } from "#components/EditorComposer.vue"
import { $getNodeByKey, $setSelection, SELECTION_CHANGE_COMMAND } from "lexical"
import { CodeBlockNode } from "../CodeBlockNode"
import LanguagePicker from "./LanguagePicker.vue"
import * as css from "./CodeBlockDecorator.css"
import { useDarkMode } from "@weave/ui/theme"
import {
  changeLanguage,
  CodeLanguage,
  languageList,
  languages,
  matchLanguageName,
  PLAIN_TEXT,
} from "../extensions/languages"
import { basicSetup } from "../extensions/basicSetup"
import { themes, changeTheme } from "../extensions/themes"
import { SELECT_BLOCK_COMMAND } from "#core/nodes"

const { nodeKey, code, language } = defineProps<CodeBlockDecoratorProps>()

const { editor } = useComposerContext()
let view: EditorView
let rootElement: HTMLElement
const container = useTemplateRef("codemirrorKey")
const activeLang = shallowRef<CodeLanguage>(
  language ? matchLanguageName(languageList, language) : PLAIN_TEXT,
)

// TODO: This can be a part of the composer context
const isDark = useDarkMode()

watch(isDark, dark => {
  changeTheme(view, { mode: dark ? "dark" : "light" })
})

function handleViewUpdate(updates: ViewUpdate) {
  if (updates.docChanged) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as CodeBlockNode
      node.setCode(updates.state.doc.toString())
    })
  }
  if (updates.focusChanged) {
    if (view.hasFocus) {
      editor.update(() => {
        $setSelection(null)
        editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined)
      })
    }
  }
}

const handleLanguageChange = (lang: CodeLanguage) => {
  activeLang.value = lang
  changeLanguage(view, lang)
  editor.update(() => {
    const node = $getNodeByKey(nodeKey) as CodeBlockNode
    node.setLanguage(lang.name)
  })
  view.focus()
}

const handleSelectionEscape = (isBackward: boolean) => {
  editor.update(() => {
    const node = $getNodeByKey(nodeKey) as CodeBlockNode
    rootElement.focus({ preventScroll: true })
    // This may differ from the default behavior of the browser,
    // as the offset will not be aligned with the cursor
    if (isBackward) node.selectPrevious()
    else node.selectNext()
  })
}

onMounted(() => {
  rootElement = editor.getRootElement()!
  view = new EditorView({
    doc: code,
    parent: container.value!,
    extensions: [
      keymap.of([
        {
          key: "ArrowUp",
          run: () => {
            const pos = view.state.selection.main.head
            const blockInfo = view.lineBlockAt(pos)
            if (blockInfo.from === 0) {
              handleSelectionEscape(true)
              return true
            }
            return false
          },
          stopPropagation: true,
        },
        {
          key: "ArrowDown",
          run: () => {
            const pos = view.state.selection.main.head
            const blockInfo = view.lineBlockAt(pos)
            if (blockInfo.to === view.state.doc.length) {
              handleSelectionEscape(false)
              return true
            }
            return false
          },
          stopPropagation: true,
        },
        {
          key: "Backspace",
          run: () => {
            const pos = view.state.selection.main.head
            if (view.state.selection.main.empty && pos === 0) {
              if (view.state.doc.length === 0) {
                editor.read(() => {
                  const node = $getNodeByKey(nodeKey) as CodeBlockNode
                  rootElement.focus({ preventScroll: true })
                  window.getSelection()?.removeAllRanges()
                  editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node })
                })
              } else {
                handleSelectionEscape(true)
              }
              return true
            }
            return false
          },
          stopPropagation: true,
        },
        {
          key: "Mod-a",
          run: () => {
            const range = view.state.selection.main
            if (range.from === 0 && range.to === view.state.doc.length) {
              const codeBlock = editor.read(() => $getNodeByKey(nodeKey)) as CodeBlockNode
              rootElement.focus({ preventScroll: true })
              editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: codeBlock })
              return true
            }
            return false
          },
        },
      ]),
      basicSetup(),
      languages(() => view, { language: activeLang.value }),
      themes({ mode: isDark.value ? "dark" : "light" }),
      EditorView.updateListener.of(handleViewUpdate),
    ],
  })
  view.focus()
})

defineExpose<CodeBlockDecoratorExpose>({
  selectStart: () => {
    view.focus()
    view.dispatch({ selection: { anchor: 0 } })
  },
  selectEnd: () => {
    view.focus()
    view.dispatch({ selection: { anchor: view.state.doc.length } })
  },
})
</script>

<template>
  <div
    :class="['CodeBlockDecorator__root', css.root]"
    @keydown.stop="
      () => {
        // Prevent key command conflicts with the lexical editor
      }
    "
  >
    <div ref="codemirrorKey" :class="['CodeBlockDecorator__editor', css.editor]" />
    <LanguagePicker
      :class="css.langPicker"
      :languages="languageList"
      :model-value="activeLang"
      @update:model-value="handleLanguageChange"
    />
  </div>
</template>
