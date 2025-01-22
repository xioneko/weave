import type { NodeMarkdownSerializer } from "#core/markdown"
import { type SerializedElementBlockNode, ElementBlockNode } from "#core/nodes"
import {
  $createParagraphNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type ElementFormatType,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type ParagraphNode,
  type RangeSelection,
  type Spread,
} from "lexical"
import { Simplify } from "type-fest"

export type SerializedHeadingNode = Simplify<
  Spread<
    {
      tag: HeadingTagType
    },
    SerializedElementBlockNode
  >
>

export type HeadingTagType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export class HeadingNode extends ElementBlockNode {
  __tag: HeadingTagType

  static override getType(): string {
    return "heading"
  }

  static override clone(node: HeadingNode): HeadingNode {
    return new HeadingNode(node.__tag, node.__key)
  }

  constructor(tag: HeadingTagType, key?: NodeKey) {
    super(key)
    this.__tag = tag
  }

  getTag(): HeadingTagType {
    return this.__tag
  }

  override canIndent(): boolean {
    return false
  }

  override extractWithChild(
    _child: LexicalNode,
    _selection: BaseSelection | null,
    _destination: "clone" | "html",
  ): boolean {
    return true
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const element = super.createDOM(config, editor, this.__tag)
    const headingClass = config.theme.heading?.[this.__tag]
    if (headingClass) {
      element.className = headingClass
    }
    return element
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return super.updateDOM(prevNode, dom, config)
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedHeadingNode {
    return {
      ...super.exportJSON(),
      tag: this.getTag(),
      type: HeadingNode.getType(),
    }
  }

  static override importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
    return $createHeadingNode(serializedNode.tag).updateFromJSON(serializedNode)
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement(this.__tag)
    element.style.textAlign = this.getFormatType()
    return {
      element,
    }
  }

  static override importDOM(): DOMConversionMap {
    return {
      h1: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
      h2: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
      h3: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
      h4: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
      h5: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
      h6: () => ({
        conversion: $convertHeadingElement,
        priority: 0,
      }),
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = (exportChildren): string => {
    const level = +this.getTag().slice(1)
    return exportChildren(this, { linePrefix: "#".repeat(level) + " " })
  }

  /* -------------------------------- Mutation -------------------------------- */

  override insertNewAfter(
    selection: RangeSelection,
    restoreSelection?: boolean,
  ): ParagraphNode | HeadingNode {
    const anchorOffset = selection.anchor.offset
    if (anchorOffset === 0 && !this.isEmpty()) {
      const heading = $createHeadingNode(this.__tag)
      this.insertAfter(heading, restoreSelection)
      const paragraph = $createParagraphNode()
      this.replace(paragraph, true)
      paragraph.select()
      return heading
    } else {
      const paragraph = $createParagraphNode()
      this.insertAfter(paragraph, restoreSelection)
      return paragraph
    }
  }

  override collapseAtStart(selection: RangeSelection): boolean {
    const paragraph = $createParagraphNode()
    const children = this.getChildren()
    paragraph.append(...children)
    this.replace(paragraph)
    return true
  }
}

export function $createHeadingNode(tag: HeadingTagType): HeadingNode {
  return new HeadingNode(tag)
}

export function $isHeadingNode(node: LexicalNode | null | undefined): node is HeadingNode {
  return node instanceof HeadingNode
}

function $convertHeadingElement(element: HTMLElement): DOMConversionOutput {
  const nodeName = element.nodeName.toLowerCase()
  const node = $createHeadingNode(nodeName as HeadingTagType)
  node.setFormat(element.style.textAlign as ElementFormatType)
  return { node }
}
