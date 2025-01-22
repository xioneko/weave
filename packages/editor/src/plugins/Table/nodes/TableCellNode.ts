import { $isInlineNode, getNodeKeyFromDOMNode } from "#shared/node.ts"
import { $isTableNode, type TableNode } from "./TableNode"
import { $createTableRowNode } from "./TableRowNode"
import {
  $createLineBreakNode,
  $createTextNode,
  $getEditor,
  $getNodeByKey,
  $isElementNode,
  $isLineBreakNode,
  ElementNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from "lexical"

export type SerializedTableCellNode = Spread<
  {
    colSpan: number
    rowSpan: number
  },
  SerializedElementNode
>

export class TableCellNode extends ElementNode {
  __colSpan: number
  __rowSpan: number

  static override getType(): string {
    return "tablecell"
  }

  static override clone(node: TableCellNode): TableCellNode {
    return new TableCellNode(node.__colSpan, node.__rowSpan, node.__key)
  }

  constructor(colSpan: number = 1, rowSpan: number = 1, key?: NodeKey) {
    super(key)
    this.__colSpan = colSpan
    this.__rowSpan = rowSpan
  }

  getColSpan(): number {
    return this.getLatest().__colSpan
  }

  setColSpan(colSpan: number): void {
    this.getWritable().__colSpan = colSpan
  }

  getRowSpan(): number {
    return this.getLatest().__rowSpan
  }

  setRowSpan(rowSpan: number): void {
    this.getWritable().__rowSpan = rowSpan
  }

  override canIndent(): boolean {
    return false
  }

  override isInline(): boolean {
    return false
  }

  override isParentRequired(): boolean {
    return true
  }

  override createParentElementNode(): ElementNode {
    return $createTableRowNode()
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("td")

    if (config.theme.tableCell) dom.className = config.theme.tableCell

    if (this.__colSpan > 1) dom.colSpan = this.__colSpan
    if (this.__rowSpan > 1) dom.rowSpan = this.__rowSpan

    return dom
  }

  override updateDOM(_prevNode: this, dom: HTMLTableCellElement, _config: EditorConfig): boolean {
    if (this.__colSpan > 1) {
      dom.colSpan = this.__colSpan
    } else {
      dom.removeAttribute("colSpan")
    }
    if (this.__rowSpan > 1) {
      dom.rowSpan = this.__rowSpan
    } else {
      dom.removeAttribute("rowSpan")
    }
    return false
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedTableCellNode {
    return {
      ...super.exportJSON(),
      type: TableCellNode.getType(),
      colSpan: this.__colSpan,
      rowSpan: this.__rowSpan,
    }
  }

  static override importJSON(serializedNode: SerializedTableCellNode): TableCellNode {
    const cell = $createTableCellNode().updateFromJSON(serializedNode)
    cell.__colSpan = serializedNode.colSpan
    cell.__rowSpan = serializedNode.rowSpan
    return cell
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("td")
    if (this.__colSpan > 1) element.colSpan = this.__colSpan
    if (this.__rowSpan > 1) element.rowSpan = this.__rowSpan
    return { element }
  }

  static override importDOM(): DOMConversionMap<HTMLTableCellElement> {
    return {
      td: () => ({
        conversion: $convertTableCellElement,
      }),
      th: () => ({
        conversion: $convertTableCellElement,
      }),
    }
  }

  /* -------------------------------- Mutation -------------------------------- */

  override append(...nodes: LexicalNode[]): this {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if ($isInlineNode(node)) {
        super.append(node)
      } else if ($isElementNode(node)) {
        this.append(...node.getChildren())
        node.remove()
        const lastChild = this.getLastChild()
        if (!$isLineBreakNode(lastChild) && i !== nodes.length - 1) {
          this.append($createLineBreakNode())
        }
      } else {
        this.append($createTextNode(node.getTextContent()))
      }
    }
    return this
  }
}

export function $createTableCellNode(): TableCellNode {
  return new TableCellNode()
}

export function $isTableCellNode(node: LexicalNode | null | undefined): node is TableCellNode {
  return node instanceof TableCellNode
}

export function $getTableFromCellOrThrow(cell: TableCellNode): TableNode {
  const table = cell.getParent()?.getParent()
  if (!$isTableNode(table)) {
    throw new Error("Cannot find the table from the cell")
  }
  return table
}

function $convertTableCellElement(element: HTMLTableCellElement): DOMConversionOutput {
  const cell = $createTableCellNode()
  cell.__colSpan = element.colSpan
  cell.__rowSpan = element.rowSpan
  return { node: cell }
}

export function $getNearestCellFromDOMNode(domNode: Node): TableCellNode | null {
  const editor = $getEditor()
  const root = editor.getRootElement()
  let node: Node | null = domNode
  while (node && node !== root) {
    if (node.nodeName === "TD") {
      const key = getNodeKeyFromDOMNode(node, editor)
      if (key) {
        return $getNodeByKey<TableCellNode>(key, editor._editorState)
      }
    }
    node = node.parentElement
  }
  return null
}
