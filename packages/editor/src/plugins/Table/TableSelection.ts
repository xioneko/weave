import type { TableCellNode, TableMap, TableMapValue, TableNode } from "./nodes"
import {
  $createNodeSelection,
  $createPoint,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  isCurrentlyReadOnlyMode,
  type BaseSelection,
  type LexicalNode,
  type NodeKey,
  type NodeSelection,
  type PointType,
} from "lexical"

export class TableSelection implements BaseSelection {
  anchor: PointType
  focus: PointType
  tableKey: NodeKey
  _cachedNodes: LexicalNode[] | null
  _cachedBoundary: TableSelectionBoundary | null
  dirty: boolean

  constructor(tableKey: NodeKey, anchor: PointType, focus: PointType) {
    this.anchor = anchor
    this.focus = focus
    anchor._selection = this
    focus._selection = this
    this.tableKey = tableKey
    this._cachedNodes = null
    this._cachedBoundary = null
    this.dirty = false
  }

  getStartEndPoints(): [PointType, PointType] {
    return [this.anchor, this.focus]
  }

  isBackward(): boolean {
    return this.focus.isBefore(this.anchor)
  }

  getCachedNodes(): LexicalNode[] | null {
    return this._cachedNodes
  }

  setCachedNodes(nodes: LexicalNode[] | null): void {
    this._cachedNodes = nodes
  }

  is(selection: null | BaseSelection): boolean {
    return (
      selection instanceof TableSelection &&
      this.tableKey === selection.tableKey &&
      this.anchor.is(selection.anchor) &&
      this.focus.is(selection.focus)
    )
  }

  set(tableKey: NodeKey, anchorCellKey: NodeKey, focusCellKey: NodeKey): void {
    this.dirty ||=
      this.tableKey !== tableKey ||
      this.anchor.key !== anchorCellKey ||
      this.focus.key !== focusCellKey
    this.tableKey = tableKey
    this.anchor.key = anchorCellKey
    this.focus.key = focusCellKey
    // To optimize performance, when only the focusCellKey is changed,
    // we can do incremental update for the Nodes and Boundary.
    this._cachedNodes = null
    this._cachedBoundary = null
  }

  clone(): TableSelection {
    return new TableSelection(
      this.tableKey,
      $createPoint(this.anchor.key, this.anchor.offset, this.anchor.type),
      $createPoint(this.focus.key, this.focus.offset, this.focus.type),
    )
  }

  isCollapsed(): boolean {
    return false
  }

  extract(): Array<LexicalNode> {
    return this.getNodes()
  }

  insertRawText(_text: string): void {
    /* noop */
  }

  insertText(_text: string): void {
    /* noop */
  }

  insertNodes(_nodes: Array<LexicalNode>): void {
    /* noop */
  }

  getBoundary(): TableSelectionBoundary {
    if (this._cachedBoundary) {
      return this._cachedBoundary
    }
    const table = $getNodeByKey<TableNode>(this.tableKey)
    if (!table) return { minCol: 0, maxCol: 0, minRow: 0, maxRow: 0 }

    const tableMap = table.getTableMap()
    const boundary = $computeTableSelectionBoundary(tableMap, this.anchor.key, this.focus.key)

    if (!isCurrentlyReadOnlyMode()) {
      this._cachedBoundary = boundary
    }
    return boundary
  }

  getNodes(): LexicalNode[] {
    if (this._cachedNodes) {
      return this._cachedNodes
    }
    const table = $getNodeByKey<TableNode>(this.tableKey)
    if (!table) return []

    const tableMap = table.getTableMap()

    const { minCol, maxCol, minRow, maxRow } = this.getBoundary()
    const nodes = new Set<TableCellNode>()
    for (let row = minRow; row <= maxRow; ++row) {
      let col = minCol
      while (col <= maxCol) {
        const cell = tableMap[row][col].cell
        nodes.add(cell.getLatest())
        col += cell.__colSpan
      }
    }

    const result = Array.from(nodes)
    if (!isCurrentlyReadOnlyMode()) {
      this._cachedNodes = result
    }
    return result
  }

  getTextContent(): string {
    const nodes = this.getNodes()
    let textContent = ""
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i]
      const row = node.__parent
      const nextRow = (nodes[i + 1] || {}).__parent
      textContent += node.getTextContent() + (nextRow !== row ? "\n" : "\t")
    }
    return textContent
  }

  static $toNodeSelection(selection: TableSelection): NodeSelection {
    const nodeSelection = $createNodeSelection()

    const table = $getNodeByKey<TableNode>(selection.tableKey)
    if (table) {
      const { minRow, maxRow, minCol, maxCol } = selection.getBoundary()
      const columns = table.getColumnsCount()
      const rows = table.getChildrenSize()
      const isWholeTableSelected = maxCol - minCol === columns - 1 && maxRow - minRow === rows - 1
      if (isWholeTableSelected) {
        nodeSelection.add(table.__key)
        table.getChildren().forEach(row => nodeSelection.add(row.__key))
      }
    }

    selection.getNodes().forEach(node => addNodeRecursively(node))
    function addNodeRecursively(node: LexicalNode): void {
      nodeSelection.add(node.__key)
      if ($isElementNode(node)) {
        node.getChildren().forEach(child => addNodeRecursively(child))
      }
    }

    return nodeSelection
  }
}

export function $isTableSelection(
  selection: BaseSelection | null | undefined,
): selection is TableSelection {
  return selection instanceof TableSelection
}

export function $createTableSelectionFrom(
  tableNode: TableNode,
  anchorCell: TableCellNode,
  focusCell: TableCellNode,
): TableSelection {
  const prevSelection = $getSelection()
  if ($isTableSelection(prevSelection)) {
    const selection = prevSelection.clone()
    selection.set(tableNode.__key, anchorCell.__key, focusCell.__key)
    return selection
  }
  return new TableSelection(
    tableNode.__key,
    $createPoint(anchorCell.__key, 0, "element"),
    $createPoint(focusCell.__key, 0, "element"),
  )
}

type TableSelectionBoundary = {
  minCol: number
  maxCol: number
  minRow: number
  maxRow: number
}

function $computeTableSelectionBoundary(
  tableMap: TableMap,
  anchorCellKey: NodeKey,
  focusCellKey: NodeKey,
): TableSelectionBoundary {
  const { cell: anchorCell, col: anchorCol, row: anchorRow } = tableMap.cells[anchorCellKey]
  const { cell: focusCell, col: focusCol, row: focusRow } = tableMap.cells[focusCellKey]

  let left = Math.min(anchorCol, focusCol)
  let up = Math.min(anchorRow, focusRow)
  let right = Math.max(anchorCol + anchorCell.__colSpan - 1, focusCol + focusCell.__colSpan - 1)
  let bottom = Math.max(anchorRow + anchorCell.__rowSpan - 1, focusRow + focusCell.__rowSpan - 1)

  const visited = new Set<NodeKey>([anchorCellKey, focusCellKey])

  // prettier-ignore
  let l = left, r = right, u = up, b = bottom
  for (let row = u; row <= b; ++row) {
    for (let col = l; col <= r; ++col) tryExpand(tableMap[row][col])
  }

  while (l > left || r < right || u > up || b < bottom) {
    while (l > left) {
      l -= 1
      for (let row = u; row < b; ++row) tryExpand(tableMap[row][l])
    }
    while (u > up) {
      u -= 1
      for (let col = l; col < r; ++col) tryExpand(tableMap[u][col])
    }
    while (r < right) {
      r += 1
      for (let row = u; row < b; ++row) tryExpand(tableMap[row][r])
    }
    while (b < bottom) {
      b += 1
      for (let col = l; col < r; ++col) tryExpand(tableMap[b][col])
    }
  }

  function tryExpand(value: TableMapValue) {
    const key = value.cell.__key
    if (visited.has(key)) return
    visited.add(key)
    left = Math.min(left, value.col)
    right = Math.max(right, value.col + value.cell.__colSpan - 1)
    up = Math.min(up, value.row)
    bottom = Math.max(bottom, value.row + value.cell.__rowSpan - 1)
  }

  return { minCol: left, maxCol: right, minRow: up, maxRow: bottom }
}
