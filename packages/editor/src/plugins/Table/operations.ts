import { __assert__ } from "#shared/dev.ts"
import { $getBlockElementNodeAtPoint } from "#shared/selection.ts"
import { type TableSelection, $isTableSelection } from "./TableSelection"
import {
  type TableCellNode,
  $getTableFromCellOrThrow,
  type TableRowNode,
  $isTableCellNode,
  type TableNode,
  $createTableCellNode,
  $createTableRowNode,
} from "./nodes"
import { type BaseSelection, $isRangeSelection } from "lexical"

export function $handleDeletion(selection: TableSelection): void {
  const cells = selection.getNodes() as TableCellNode[]
  const table = $getTableFromCellOrThrow(cells[0])
  const firstCell = table.getFirstChild<TableRowNode>()!.getFirstChild()!
  const lastCell = table.getLastChild<TableRowNode>()!.getLastChild()!
  if (cells[0].__key === firstCell.__key && cells[cells.length - 1].__key === lastCell.__key) {
    table.remove()
    return
  }
  cells.forEach(cell => cell.clear())
  selection.focus.getNode().select()
}

export function $handleNavigation(
  selection: BaseSelection | null,
  event: KeyboardEvent,
  direction: "up" | "down" | "left" | "right",
): boolean {
  if ($isRangeSelection(selection)) {
    const cell = $getBlockElementNodeAtPoint(selection.focus)
    if ($isTableCellNode(cell)) {
      if (direction === "up" || direction === "down") {
        const table = $getTableFromCellOrThrow(cell)
        const tableMap = table.getTableMap()
        const { row, col } = tableMap.cells[cell.__key]
        let current = cell
        let newRow = row
        while (true) {
          newRow += direction === "down" ? current.__rowSpan : -1
          if (newRow < 0) {
            table.selectPrevious()
            break
          } else if (newRow >= tableMap.length) {
            table.selectNext()
            break
          } else {
            const value = tableMap[newRow][col]
            // If the cell is merged, and the starting column is not
            // the same as the current column, we will skip it.
            if (value.col === col) {
              value.cell.select()
              break
            }
            current = value.cell
          }
        }
      } else if (direction === "left") {
        let prevCell = cell.getPreviousSibling<TableCellNode>()
        if (!prevCell) {
          const row = cell.getParent<TableRowNode>()!
          const prevRow = row.getPreviousSibling<TableRowNode>()
          if (prevRow) prevCell = prevRow.getLastChild<TableCellNode>()!
        }
        prevCell?.select()
      } /* direction === "right" */ else {
        let nextCell = cell.getNextSibling<TableCellNode>()
        if (!nextCell) {
          const row = cell.getParent<TableRowNode>()!
          const nextRow = row.getNextSibling<TableRowNode>()
          if (nextRow) nextCell = nextRow.getFirstChild<TableCellNode>()!
        }
        nextCell?.select()
      }
      event.preventDefault()
      return true
    }
  } else if ($isTableSelection(selection)) {
    const focusCell = selection.focus.getNode() as TableCellNode
    focusCell.select()
    event.preventDefault()
    return true
  }
  return false
}

export function $mergeCells(selection: TableSelection): TableCellNode {
  const cells = selection.getNodes() as TableCellNode[]
  const { minCol, maxCol, minRow, maxRow } = selection.getBoundary()
  const firstCell = cells[0]
  firstCell.setColSpan(maxCol - minCol + 1)
  firstCell.setRowSpan(maxRow - minRow + 1)
  for (let i = 1; i < cells.length; ++i) {
    const cell = cells[i]
    firstCell.append(...cell.getChildren())
    cell.remove()
  }
  return firstCell
}

export function $unmergeCells(cell: TableCellNode, table: TableNode): void {
  if (cell.__colSpan > 1) {
    for (let i = 1; i < cell.__colSpan; ++i) {
      cell.insertAfter($createTableCellNode())
    }
    cell.setColSpan(1)
  }

  if (cell.__rowSpan > 1) {
    const tableMap = table.getTableMap()
    const { row, col } = tableMap.cells[cell.__key]

    let currentRow = cell.getParent<TableRowNode>()!
    for (let i = 1; i < cell.__rowSpan; ++i) {
      currentRow = currentRow.getNextSibling<TableRowNode>()!
      if (currentRow.isEmpty()) {
        for (let j = 0; j < cell.__colSpan; ++j) {
          currentRow.append($createTableCellNode())
        }
      } else if (col > 0) {
        const prevCell = tableMap[row + i][col - 1].cell
        for (let j = 0; j < cell.__colSpan; ++j) {
          prevCell.insertAfter($createTableCellNode())
        }
      } else {
        const nextCell = tableMap[row + i][col + cell.__colSpan].cell
        for (let j = 0; j < cell.__colSpan; ++j) {
          nextCell.insertBefore($createTableCellNode())
        }
      }
    }
    cell.setRowSpan(1)
  }
}

export function $insertRow(
  cell: TableCellNode,
  table: TableNode,
  insertAbove: boolean,
): TableRowNode {
  const tableMap = table.getTableMap()
  const { row: startRow } = tableMap.cells[cell.__key]
  const row = insertAbove ? startRow : startRow + cell.__rowSpan - 1
  const tableRow = table.getChildAtIndex<TableRowNode>(row)!
  const newTableRow = $createTableRowNode()
  const columns = tableMap[row].length
  for (let col = 0; col < columns; ++col) {
    const value = tableMap[row][col]
    const edgeRow = insertAbove ? value.row : value.row + value.cell.__rowSpan - 1
    if (edgeRow == row) {
      newTableRow.append($createTableCellNode())
    } else if (value.col === col /* The rowSpan only needs to be set once */) {
      // `value.cell` is across the row to be inserted
      value.cell.setRowSpan(value.cell.__rowSpan + 1)
    }
  }
  if (insertAbove) {
    tableRow.insertBefore(newTableRow)
  } else {
    tableRow.insertAfter(newTableRow)
  }
  return newTableRow
}

export function $insertColumn(
  cell: TableCellNode,
  table: TableNode,
  insertLeft: boolean,
): TableCellNode {
  const tableMap = table.getTableMap()
  const { col: startCol } = tableMap.cells[cell.__key]
  const col = insertLeft ? startCol : startCol + cell.__colSpan - 1
  const rows = tableMap.length
  const columns = tableMap[0].length
  let firstCell: TableCellNode | undefined
  for (let row = 0; row < rows; ++row) {
    const value = tableMap[row][col]
    const edgeCol = insertLeft ? value.col : value.col + value.cell.__colSpan - 1
    if (edgeCol == col) {
      const newCell = $createTableCellNode()
      if (!firstCell) firstCell = newCell
      if (value.row === row) {
        insertLeft ? value.cell.insertBefore(newCell) : value.cell.insertAfter(newCell)
      } else {
        let nextCol = col + 1
        while (nextCol < columns && tableMap[row][nextCol].row !== row) {
          nextCol += 1
        }
        if (nextCol < columns) {
          tableMap[row][nextCol].cell.insertBefore(newCell)
        } else {
          const tableRow = table.getChildAtIndex<TableRowNode>(row)!
          tableRow.append(newCell)
        }
      }
    } else if (value.row === row /* The colSpan only needs to be set once */) {
      // `value.cell` is across the column to be inserted
      value.cell.setColSpan(value.cell.__colSpan + 1)
    }
  }

  const columnWidths = table.getColumnWidths()
  const newColumnWidths = columnWidths.slice()
  newColumnWidths.splice(insertLeft ? col : col + 1, 0, undefined)
  table.setColumnsWidths(newColumnWidths)

  return firstCell!
}

export function $deleteRow(start: number, end: number, table: TableNode): void {
  const tableMap = table.getTableMap()
  const rows = tableMap.length
  const columns = tableMap[0].length
  __assert__(start >= 0 && end <= rows, "Invalid row range")

  if (start === 0 && end === rows) {
    table.selectPrevious()
    table.remove()
    return
  }

  for (let col = 0; col < columns; ++col) {
    let row = start
    while (row < end) {
      const { cell, row: cellRow, col: cellCol } = tableMap[row][col]
      if (cellCol === col) {
        // If `cellCol !== col`, it means the cell has been visited
        if (cellRow < start) {
          // overflow top / both
          const diff = Math.min(end, cellRow + cell.__rowSpan) - start
          cell.setRowSpan(cell.__rowSpan - diff)
        } else if (cellRow + cell.__rowSpan - 1 >= end) {
          // overflow bottom
          if (cellCol === 0) {
            const nextCell = tableMap[end][cellCol + cell.__colSpan].cell
            nextCell.insertBefore(cell)
          } else {
            const prevCell = tableMap[end][cellCol - 1].cell
            prevCell.insertAfter(cell)
          }
          cell.setRowSpan(cell.__rowSpan - (end - cellRow))
        }
      }
      row = cellRow + cell.__rowSpan
    }
  }

  let tableRow = table.getChildAtIndex<TableRowNode>(start)
  for (let i = start; i < end; ++i) {
    const nextRow = tableRow!.getNextSibling<TableRowNode>()
    tableRow!.remove()
    tableRow = nextRow
  }

  if (tableRow) {
    tableRow.select(0, 0)
  } else {
    table.select()
  }
}

export function $deleteColumn(start: number, end: number, table: TableNode): void {
  const tableMap = table.getTableMap()
  const columns = tableMap[0].length
  const rows = tableMap.length
  __assert__(start >= 0 && end <= columns, "Invalid column range")

  if (start === 0 && end === columns) {
    table.selectPrevious()
    table.remove()
    return
  }

  for (let row = 0; row < rows; ++row) {
    let col = start
    while (col < end) {
      const { cell, col: cellCol, row: cellRow } = tableMap[row][col]
      if (cellRow === row) {
        // If `cellRow !== row`, it means the cell has been visited
        if (cellCol < start) {
          // overflow left / both
          const diff = Math.min(end, cellCol + cell.__colSpan) - start
          cell.setColSpan(cell.__colSpan - diff)
        } else if (cellCol + cell.__colSpan - 1 >= end) {
          // overflow right
          cell.setColSpan(cell.__colSpan - (end - cellCol))
        } else {
          cell.remove()
        }
      }
      col = cellCol + cell.__colSpan
    }
  }

  const columnWidths = table.getColumnWidths()
  const newColumnWidths = columnWidths.slice()
  newColumnWidths.splice(start, end - start)
  table.setColumnsWidths(newColumnWidths)

  const firstCell = end === columns ? tableMap[0][start - 1].cell : tableMap[0][end].cell
  firstCell.select(0, 0)
}
