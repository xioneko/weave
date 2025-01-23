import type { NodeMarkdownSerializer } from "#core/markdown"
import { DecoratorBlockNode, type Decorator, type SerializedDecoratorBlockNode } from "#core/nodes"
import CodeBlockDecorator from "./components/CodeBlockDecorator.vue"
import type { CodeBlockDecoratorProps } from "./components/CodeBlockDecorator.vue"
import {
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type Spread,
} from "lexical"
import { type FunctionalComponent } from "vue"

export type SerializedCodeBlockNode = Spread<
  {
    language: string | undefined
    code: string
  },
  SerializedDecoratorBlockNode
>

// TODO: Codemirror is embedded as a decorator node into the Lexical editor,
// so that it cannot work well with the history plugin, and it is
// easy to cause keyboard key conflicts. I'm looking for a better solution.

export class CodeBlockNode extends DecoratorBlockNode<typeof CodeBlockDecorator> {
  __language: string | undefined
  __code: string

  static override getType(): string {
    return "code-block"
  }

  static override clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(node.__language, node.__code, node.__key)
  }

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
  }

  constructor(language?: string, code?: string, key?: NodeKey) {
    super(key)
    this.__language = language
    this.__code = code ?? ""
  }

  getLanguage(): string | undefined {
    const self = this.getLatest()
    return self.__language
  }

  setLanguage(language: string | undefined) {
    const self = this.getWritable()
    self.__language = language
  }

  getCode(): string {
    const self = this.getLatest()
    return self.__code
  }

  setCode(code: string) {
    const self = this.getWritable()
    self.__code = code
  }

  override getTextContent(): string {
    return this.getCode()
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDecorator(
    _editor: LexicalEditor,
    _config: EditorConfig,
  ): Decorator<typeof CodeBlockDecorator> {
    return {
      component: CodeBlockDecorator,
      props: {
        nodeKey: this.__key,
        language: this.__language,
        code: this.__code,
      },
    }
  }

  override updateDecorator(
    _editor: LexicalEditor,
    _config: EditorConfig,
    props: CodeBlockDecoratorProps,
  ): boolean {
    props.code = this.__code
    props.language = this.__language
    return false
  }

  override decorate(editor: LexicalEditor, config: EditorConfig): FunctionalComponent {
    return super.decorate(editor, config)
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedCodeBlockNode {
    return {
      type: CodeBlockNode.getType(),
      language: this.getLanguage(),
      code: this.getCode(),
      version: 1,
    }
  }

  static override importJSON(serializedNode: SerializedCodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(serializedNode.language, serializedNode.code)
  }

  override exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("pre")
    const code = document.createElement("code")
    element.appendChild(code)
    code.textContent = this.getTextContent()
    return { element }
  }

  static override importDOM(): DOMConversionMap {
    return {
      pre: () => {
        return {
          conversion: element => {
            const code = element.textContent ?? ""
            return { node: $createCodeBlockNode(undefined, code) }
          },
        }
      },
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = () => {
    return `\`\`\`${this.getLanguage() || ""}\n${this.getCode()}\n\`\`\`\n`
  }

  /* -------------------------------- Selection ------------------------------- */
  // TODO: If the decorator hasn't been created, the select method has no effect.
  override selectStart(): RangeSelection {
    const instance = this.getInstance()
    instance?.selectStart()
    // @ts-expect-error
    return null
  }

  override selectEnd(): RangeSelection {
    const instance = this.getInstance()
    instance?.selectEnd()
    // @ts-expect-error
    return null
  }
}

export function $isCodeBlockNode(node: LexicalNode | null | undefined): node is CodeBlockNode {
  return node instanceof CodeBlockNode
}

export function $createCodeBlockNode(language?: string, code?: string): CodeBlockNode {
  return new CodeBlockNode(language, code)
}
