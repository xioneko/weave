import { __assert__ } from "#shared/dev.ts"
import { $isListItemNode, type ListItemNode } from "./ListItemNode"
import {
  $createParagraphNode,
  ElementNode,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type ParagraphNode,
  type RangeSelection,
  type SerializedElementNode,
} from "lexical"
import type { Simplify } from "type-fest"

export type SerializedListParagraphNode = Simplify<SerializedElementNode>

export class ListParagraphNode extends ElementNode {
  static override getType(): string {
    return "list-paragraph"
  }

  static override clone(node: ListParagraphNode): ListParagraphNode {
    return new ListParagraphNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  static from(paragraph: ParagraphNode): ListParagraphNode {
    const listParagraph = new ListParagraphNode()
    const children = paragraph.getChildren()
    listParagraph.append(...children)
    return listParagraph
  }

  static toParagraph(listParagraph: ListParagraphNode): ParagraphNode {
    const paragraph = $createParagraphNode()
    const children = listParagraph.getChildren()
    paragraph.append(...children)
    return paragraph
  }

  override isInline(): false {
    return false
  }

  override canIndent(): boolean {
    return true
  }

  override setIndent(indentLevel: number): this {
    const listItem = this.getParent()
    __assert__($isListItemNode(listItem), "Expected a ListItemNode parent")
    listItem.setIndent(indentLevel)
    return this
  }

  override getIndent(): number {
    const listItem = this.getParent()
    __assert__($isListItemNode(listItem), "Expected a ListItemNode parent")
    return listItem.getIndent()
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("p")
    if (config.theme.paragraph) {
      dom.className = config.theme.paragraph
    }
    return dom
  }

  override exportJSON(): SerializedListParagraphNode {
    return {
      ...super.exportJSON(),
      type: ListParagraphNode.getType(),
    }
  }

  static override importJSON(serializedNode: SerializedListParagraphNode): ListParagraphNode {
    return $createListParagraphNode()
  }

  override updateDOM(
    _prevNode: ListParagraphNode,
    _dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    return false
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("p")
    if (this.isEmpty()) {
      element.appendChild(document.createElement("br"))
    }
    return {
      element,
    }
  }

  override insertNewAfter(
    rangeSelection: RangeSelection,
    restoreSelection?: boolean,
  ): ListItemNode {
    // __trace__(ListParagraphNode, this.insertNewAfter, arguments)
    const listItem = this.getParent()
    __assert__($isListItemNode(listItem), "Expected a ListItemNode parent")
    return listItem.insertNewAfter(rangeSelection, restoreSelection)
  }

  override collapseAtStart(selection: RangeSelection): boolean {
    // __trace__(ListParagraphNode, this.collapseAtStart, arguments)
    const listItem = this.getParent()
    __assert__($isListItemNode(listItem), "Expected a ListItemNode parent")
    return listItem.collapseAtStart(selection)
  }
}

export function $isListParagraphNode(
  node: LexicalNode | null | undefined,
): node is ListParagraphNode {
  return node instanceof ListParagraphNode
}

export function $createListParagraphNode(): ListParagraphNode {
  return new ListParagraphNode()
}
