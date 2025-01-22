import { $importFromDOM } from "./importDOM"
import {
  type TextFormatTagMap,
  type MarkdownTokenParserMap,
  $exportAsMarkdown,
  $importFromMarkdown,
} from "./markdown"
import type { EditorPlugin } from "./types"
import { $insertGeneratedNodes } from "@lexical/clipboard"
import { $generateHtmlFromNodes } from "@lexical/html"
import {
  $createRangeSelection,
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  type BaseSelection,
  type ElementNode,
  type LexicalEditor,
  type SerializedEditorState,
} from "lexical"
import MarkdownIt from "markdown-it"

export class EditorStateConverter {
  editor: LexicalEditor

  textFormatTagMap: TextFormatTagMap

  markdownIt: MarkdownIt

  tokenParserMap: MarkdownTokenParserMap

  constructor(editor: LexicalEditor, plugins: EditorPlugin[]) {
    this.editor = editor
    this.markdownIt = new MarkdownIt("commonmark", { html: false }).enable([
      "strikethrough",
      "table",
    ])
    this.textFormatTagMap = {}
    this.tokenParserMap = {}

    plugins.forEach(({ markdown }) => {
      if (markdown?.textFormatTagMap) {
        Object.assign(this.textFormatTagMap, markdown.textFormatTagMap)
      }
      if (markdown?.tokenParserMap) {
        Object.assign(this.tokenParserMap, markdown.tokenParserMap)
      }
      if (markdown?.extend) {
        this.markdownIt = markdown.extend(this.markdownIt)
      }
    })
  }

  /**
   * @note This is a lossy conversion
   */
  toMarkdown(node?: ElementNode): string {
    return this.editor.read(() => {
      node ??= $getRoot()
      return $exportAsMarkdown(node, this.textFormatTagMap)
    })
  }

  fromMarkdown(markdown: string): void {
    this.editor.update(() => {
      const root = $getRoot()
      root.clear()
      $importFromMarkdown(root, markdown, this.tokenParserMap, this.markdownIt)
      this.editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
    })
  }

  toJSON(): SerializedEditorState {
    return this.editor.getEditorState().toJSON()
  }

  fromJSON(serializedEditorState: SerializedEditorState | string): void {
    this.editor.setEditorState(this.editor.parseEditorState(serializedEditorState))
    this.editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
  }

  toHTML(selection: BaseSelection | null = null): string {
    return this.editor.read(() => $generateHtmlFromNodes(this.editor, selection))
  }

  fromHTML(dom: Node | string): void {
    this.editor.update(() => {
      try {
        let domNode: Node
        if (typeof dom === "string") {
          const parser = new DOMParser()
          domNode = parser.parseFromString(dom, "text/html").body
        } else {
          domNode = dom
        }
        const nodes = $importFromDOM(this.editor, domNode)
        const root = $getRoot()
        root.clear()
        const selection = $createRangeSelection()
        selection.anchor.set(root.__key, 0, "element")
        selection.focus.set(root.__key, 0, "element")
        $insertGeneratedNodes(this.editor, nodes, selection)
        this.editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
      } catch (err) {
        this.editor._onError(err instanceof Error ? err : new Error(`${err}`))
      }
    })
  }
}
