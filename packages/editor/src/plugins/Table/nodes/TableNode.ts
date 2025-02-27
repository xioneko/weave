import type { NodeMarkdownSerializer } from "#core/markdown"
import { ElementBlockNode, type SerializedElementBlockNode } from "#core/nodes"
import { __assert__ } from "#shared/dev.ts"
import { $isTableCellNode, type TableCellNode } from "./TableCellNode"
import { $isTableRowNode } from "./TableRowNode"
import {
  isCurrentlyReadOnlyMode,
  setDOMUnmanaged,
  type BaseSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type ElementDOMSlot,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type Spread,
} from "lexical"

export type SerializedTableNode = Spread<
  {
    columnWidths: (number | undefined)[]
    scrollable: boolean
  },
  SerializedElementBlockNode
>

export type TableMap = TableMapValue[][] & {
  cells: { [nodeKey: string]: TableMapValue }
}

export type TableMapValue = { cell: TableCellNode; row: number; col: number }

export class TableNode extends ElementBlockNode {
  __columnWidths: (number | undefined)[]
  __scrollable: boolean

  __cachedTableMap: TableMap | null = null

  static override getType(): string {
    return "table"
  }

  static override clone(node: TableNode): TableNode {
    return new TableNode(node.__columnWidths, node.__scrollable, node.__key)
  }

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
    this.__cachedTableMap = prevNode.__cachedTableMap
  }

  constructor(
    columnWidth: (number | undefined)[] = [],
    scrollable: boolean = false,
    key?: NodeKey,
  ) {
    super(key)
    this.__columnWidths = columnWidth
    this.__scrollable = scrollable
  }

  getColumnWidths(): (number | undefined)[] {
    return this.getLatest().__columnWidths
  }

  setColumnWidth(col: number, width: number | undefined): this {
    const self = this.getWritable()
    self.__columnWidths = self.__columnWidths.slice()
    self.__columnWidths[col] = width
    return this
  }

  setColumnsWidths(widths: (number | undefined)[]): this {
    this.getWritable().__columnWidths = widths
    return this
  }

  getScrollable(): boolean {
    return this.getLatest().__scrollable
  }

  setScrollable(scrollable: boolean): this {
    this.getWritable().__scrollable = scrollable
    return this
  }

  getColumnsCount(): number {
    if (this.__cachedTableMap) return this.__cachedTableMap[0].length
    const tr = this.getFirstChild()
    if (!tr) return 0
    __assert__($isTableRowNode(tr), "The child of TableNode must be TableRowNode")
    const children = tr.getChildren<TableCellNode>()
    let columns = 0
    for (let i = 0; i < children.length; ++i) {
      const cell = children[i]
      columns += cell.__colSpan
    }
    return columns
  }

  recomputeTableMap(): void {
    this.getWritable().__cachedTableMap = $computeTableMap(this)
  }

  getTableMap(): Readonly<TableMap> {
    let self = this.getLatest()
    if (self.__cachedTableMap) return self.__cachedTableMap
    const tableMap = $computeTableMap(self)
    if (!isCurrentlyReadOnlyMode()) {
      self = self.getWritable()
      self.__cachedTableMap = tableMap
    }
    return tableMap
  }

  getCellCords(cell: TableCellNode): [row: number, col: number] | null {
    const map = this.getTableMap()
    const value = map.cells[cell.__key]
    return value ? [value.row, value.col] : null
  }

  override extractWithChild(
    _child: LexicalNode,
    _selection: BaseSelection | null,
    destination: "clone" | "html",
  ): boolean {
    // Since the table's properties represents the state of the whole table,
    // we should not preserve them if the table is partially cloned.
    return destination === "html"
  }

  override canBeEmpty(): boolean {
    return false
  }

  override canIndent(): boolean {
    return false
  }

  override canInsertTextAfter(): boolean {
    return false
  }

  override canInsertTextBefore(): boolean {
    return false
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const container = super.createDOM(config, editor)
    const table = document.createElement("table")
    const colgroup = document.createElement("colgroup")
    const resizer = document.createElement("div")

    resizer.setAttribute("data-resizer", "")
    resizer.contentEditable = "false"
    table.contentEditable = "true"
    container.contentEditable = "false"
    container.style.webkitUserSelect = "none"
    container.style.userSelect = "none"

    container.append(table)
    container.append(resizer)
    table.append(colgroup)

    setDOMUnmanaged(colgroup)
    updateColgroup(container, this)

    if (this.__scrollable) {
      table.style.width = "max-content"
      container.style.overflowX = "auto"
    } else {
      table.style.width = "100%"
    }

    if (config.theme.table) {
      table.className = config.theme.table
    }
    if (config.theme.tableScrollableWrapper) {
      container.className = config.theme.tableScrollableWrapper
    }

    if (config.theme.tableResizer) {
      resizer.className = config.theme.tableResizer
    }

    return container
  }

  override getDOMSlot(element: HTMLElement): ElementDOMSlot {
    return super
      .getDOMSlot(element.firstElementChild as HTMLElement)
      .withAfter(element.querySelector("colgroup"))
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    super.updateDOM(prevNode, dom, config)

    updateColgroup(dom, this)

    const table = dom.querySelector("table")!

    if (this.__scrollable !== prevNode.__scrollable) {
      if (this.__scrollable) {
        table.style.width = "max-content"
        dom.style.overflowX = "auto"
      } else {
        table.style.width = "100%"
        dom.style.overflowX = ""
      }
    }

    return false
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedTableNode {
    return {
      ...super.exportJSON(),
      type: TableNode.getType(),
      columnWidths: this.__columnWidths,
      scrollable: this.__scrollable,
    }
  }

  static override importJSON(serializedNode: SerializedTableNode): TableNode {
    const table = $createTableNode().updateFromJSON(serializedNode)
    table.__columnWidths = serializedNode.columnWidths
    table.__scrollable = serializedNode.scrollable
    return table
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const table = document.createElement("table")
    return { element: table }
  }

  static override importDOM(): DOMConversionMap {
    return {
      table: () => ({
        conversion: element => {
          const table = $createTableNode()
          const colgroup = element.querySelector("colgroup")
          if (colgroup) {
            const widths = []
            const columns = colgroup.children
            for (let i = 0; i < columns.length; ++i) {
              const width = (columns[i] as HTMLTableColElement).style.width
              if (/^(\d+(?:\.\d+)?)px$/.test(width)) {
                widths.push(parseFloat(width))
              } else {
                widths.push(undefined)
              }
            }
            table.__columnWidths = widths
          }
          return { node: table }
        },
      }),
      colgroup: () => ({
        conversion: () => null,
      }),
      thead: () => ({
        conversion: () => null,
      }),
      tbody: () => ({
        conversion: () => null,
      }),
      tfoot: () => ({
        conversion: () => null,
      }),
      caption: () => ({
        conversion: () => null,
      }),
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = exportChildren => {
    const cells: string[][] = []
    const tableMap = this.getTableMap()
    for (let r = 0; r < tableMap.length; ++r) {
      cells[r] = []
      for (let c = 0; c < tableMap[r].length; ++c) {
        const { cell, col, row } = tableMap[r][c]
        if (col === c && row === r) {
          // prettier-ignore
          cells[r][c] = exportChildren(cell)
            .replace(/\n/g, " ")
            .replace(/\|/g, "\\|")
        } else {
          cells[r][c] = cells[row][col]
        }
      }
    }
    return (
      `| ${cells[0].join(" | ")} |\n` +
      `|${" --- |".repeat(cells[0].length)}\n` +
      cells
        .slice(1)
        .map(row => `| ${row.join(" | ")} |`)
        .join("\n")
    )
  }
}

export function $createTableNode(): TableNode {
  return new TableNode()
}

export function $isTableNode(node: LexicalNode | null | undefined): node is TableNode {
  return node instanceof TableNode
}

function updateColgroup(dom: HTMLElement, node: TableNode): void {
  const colgroup = dom.querySelector("colgroup")!
  const columns = node.getColumnsCount()
  const columnsWidths = node.getColumnWidths()
  const cols = []
  for (let i = 0; i < columns; ++i) {
    const col = document.createElement("col")
    const width = columnsWidths[i]
    if (width) {
      col.style.width = `${width}px`
    }
    cols.push(col)
  }
  colgroup.replaceChildren(...cols)
}

export function $computeTableMap(table: TableNode): TableMap {
  const map = [] as any as TableMap
  map.cells = {}
  const tableRows = table.getChildren()
  for (let row = 0; row < tableRows.length; ++row) {
    const tableRow = tableRows[row]
    __assert__($isTableRowNode(tableRow), "The child of TableNode must be TableRowNode")

    const cells = tableRow.getChildren()
    let col = 0
    let idx = 0
    map[row] ??= []
    while (idx < cells.length) {
      while (map[row][col] !== undefined) col += 1
      const cell = cells[idx]
      __assert__($isTableCellNode(cell), "The child of TableRowNode must be TableCellNode")

      const { __colSpan, __rowSpan } = cell
      const value = { cell, row, col }
      for (let r = 0; r < __rowSpan; ++r) {
        map[row + r] ??= []
        for (let c = 0; c < __colSpan; ++c) {
          map[row + r][col + c] = value
          map.cells[cell.__key] = value
        }
      }
      idx += 1
    }
  }
  return map
}
