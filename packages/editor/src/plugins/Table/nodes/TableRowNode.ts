import type { TableCellNode } from "./TableCellNode"
import { $createTableNode } from "./TableNode"
import {
  ElementNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
} from "lexical"

export type SerializedTableRowNode = Spread<{}, SerializedElementNode>

export class TableRowNode extends ElementNode {
  __height: number | undefined

  static override getType(): string {
    return "tablerow"
  }

  static override clone(node: TableRowNode): TableRowNode {
    return new TableRowNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  override canIndent(): boolean {
    return false
  }

  override isInline(): boolean {
    return false
  }

  override canInsertTextAfter(): boolean {
    return false
  }

  override canInsertTextBefore(): boolean {
    return false
  }

  override isParentRequired(): boolean {
    return true
  }

  override createParentElementNode(): ElementNode {
    return $createTableNode()
  }

  override extractWithChild(
    _child: LexicalNode,
    _selection: BaseSelection | null,
    _destination: "clone" | "html",
  ): boolean {
    return true
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("tr")
    if (this.__height) {
      dom.style.height = `${this.__height}px`
    }
    return dom
  }

  override updateDOM(_prevNode: this, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedTableRowNode {
    return {
      ...super.exportJSON(),
      type: TableRowNode.getType(),
    }
  }

  static override importJSON(serializedNode: SerializedTableRowNode): TableRowNode {
    return $createTableRowNode().updateFromJSON(serializedNode)
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("tr")
    return { element }
  }

  static override importDOM(): DOMConversionMap {
    return {
      tr: () => ({
        conversion: () => {
          return { node: $createTableRowNode() }
        },
      }),
    }
  }

  /* -------------------------------- Selection ------------------------------- */

  override select(anchorOffset?: number, focusOffset?: number): RangeSelection {
    const childrenSize = this.getChildrenSize()
    if (anchorOffset === 0 && focusOffset === 0) {
      const firstCell = this.getFirstChild<TableCellNode>()
      if (firstCell) return firstCell.select(0, 0)
    } else if (
      (anchorOffset === undefined || anchorOffset === childrenSize) &&
      (focusOffset === undefined || focusOffset === childrenSize)
    ) {
      const lastCell = this.getLastChild<TableCellNode>()
      if (lastCell) return lastCell.select()
    }
    return super.select(anchorOffset, focusOffset)
  }
}

export function $createTableRowNode(): TableRowNode {
  return new TableRowNode()
}

export function $isTableRowNode(node: LexicalNode | null | undefined): node is TableRowNode {
  return node instanceof TableRowNode
}
