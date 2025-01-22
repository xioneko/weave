import type { NodeMarkdownSerializer } from "#core/markdown"
import { __assert__ } from "#shared/dev.ts"
import { $transformToInlines } from "#shared/node.ts"
import {
  ElementNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
  type TextNode,
} from "lexical"
import type { Simplify } from "type-fest"

export type SerializedLinkNode = Simplify<
  Spread<
    {
      url: string
    },
    SerializedElementNode
  >
>

export class LinkNode extends ElementNode {
  __url: string

  static override getType(): string {
    return "link"
  }

  static override clone(node: LinkNode): LinkNode {
    return new LinkNode(node.__url, node.__key)
  }

  constructor(url: string, key?: string) {
    super(key)
    this.__url = url
  }

  getUrl(): string {
    return this.getLatest().__url
  }

  setUrl(url: string): this {
    this.getWritable().__url = url
    return this
  }

  override isInline(): boolean {
    return true
  }

  override canInsertTextBefore(): boolean {
    return false
  }

  override canInsertTextAfter(): boolean {
    return false
  }

  override canBeEmpty(): boolean {
    return false
  }

  override extractWithChild(
    child: LexicalNode,
    selection: BaseSelection | null,
    destination: "clone" | "html",
  ): boolean {
    return true
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("a")
    dom.href = this.__url
    dom.target = "_blank"
    dom.rel = "noreferrer"
    if (config.theme.link) {
      dom.className = config.theme.link
    }
    return dom
  }

  override updateDOM(_prevNode: this, dom: HTMLLinkElement, _config: EditorConfig): boolean {
    dom.href = this.__url
    return false
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedLinkNode {
    return {
      ...super.exportJSON(),
      type: LinkNode.getType(),
      url: this.__url,
    }
  }

  static override importJSON(serializedNode: SerializedLinkNode): LinkNode {
    return $createLinkNode(serializedNode.url).updateFromJSON(serializedNode)
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("a")
    element.href = this.__url
    element.target = "_blank"
    return { element }
  }

  static override importDOM(): DOMConversionMap<HTMLAnchorElement> {
    return {
      a: element => {
        const content = element.textContent
        if (!content) return null
        return {
          conversion(element) {
            return { node: $createLinkNode(element.href) }
          },
        }
      },
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = exportChildren => {
    return `[${exportChildren(this)}](${this.__url})`
  }

  /* -------------------------------- Mutation -------------------------------- */
  override insertNewAfter(_selection: RangeSelection, restoreSelection?: boolean): LinkNode {
    const link = $createLinkNode(this.__url)
    this.insertAfter(link, restoreSelection)
    return link
  }

  override append(...nodes: LexicalNode[]): this {
    return super.append(...$transformToInlines(nodes, false))
  }
}

export function $createLinkNode(url: string = ""): LinkNode {
  if (url.startsWith("javascript:") || url.startsWith("data:")) {
    url = "about:blank"
  }
  return new LinkNode(url)
}

export function $isLinkNode(node: LexicalNode | null | undefined): node is LinkNode {
  return node instanceof LinkNode
}

export function $unLink(link: LinkNode): void {
  const children = link.getChildren()
  for (let i = 0; i < children.length; i++) {
    link.insertBefore(children[i])
  }
  link.remove()
}

export function $linkify(nodes: TextNode[], url?: string): LinkNode {
  __assert__(nodes.length > 0, "Cannot linkify an empty array of text nodes")
  const link = $createLinkNode(url)
  nodes[0].insertBefore(link)
  link.append(...nodes)
  return link
}
