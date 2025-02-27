import { OPEN_CONTEXT_MENU_COMMAND } from "#plugins/ContextMenu"
import { $getBlockElementNodeAtPoint, $insertAsInlines } from "#shared/selection.ts"
import { $isTableSelection, TableSelection } from "./TableSelection"
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  $getTableFromCellOrThrow,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
} from "./nodes"
import {
  $deleteColumn,
  $deleteRow,
  $handleDeletion,
  $handleNavigation,
  $insertColumn,
  $insertRow,
  $mergeCells,
  $unmergeCells,
} from "./operations"
import { copyToClipboard, $getClipboardDataFromSelection } from "@lexical/clipboard"
import { mergeRegister, objectKlassEquals } from "@lexical/utils"
import {
  $createRangeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  COPY_COMMAND,
  createCommand,
  FORMAT_TEXT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
} from "lexical"

export type InsertTableCommandPayload = {
  columns: number
  rows: number
  after?: LexicalNode
  before?: LexicalNode
}

export const INSERT_TABLE_COMMAND: LexicalCommand<InsertTableCommandPayload> =
  createCommand("INSERT_TABLE_COMMAND")

export function registerTable(editor: LexicalEditor) {
  let cleanup: (() => void) | null = null
  return mergeRegister(
    editor.registerCommand(
      INSERT_TABLE_COMMAND,
      ({ rows, columns, before, after }) => {
        const table = $createTableNode()
        for (let i = 0; i < rows; ++i) {
          const row = $createTableRowNode()
          for (let j = 0; j < columns; ++j) {
            const cell = $createTableCellNode()
            row.append(cell)
          }
          table.append(row)
        }
        if (before) {
          before.insertBefore(table)
        } else if (after) {
          after.insertAfter(table)
        } else {
          const root = $getRoot()
          root.append(table)
        }
        table.select(0, 0)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------------- Selection ------------------------------- */
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        cleanup?.()
        if ($isTableSelection(selection)) {
          const cells = selection.getNodes()
          cells.forEach(cell => {
            const cellElem = editor.getElementByKey(cell.__key)!
            cellElem.setAttribute("data-selected", "")
          })
          cleanup = () => {
            cells.forEach(cell => {
              const cellElem = editor.getElementByKey(cell.__key)
              cellElem?.removeAttribute("data-selected")
            })
            cleanup = null
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------- Insertion & Deletion -------------------------- */
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isTableSelection(selection)) {
          $handleDeletion(selection)
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isTableSelection(selection)) {
          $handleDeletion(selection)
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      _event => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const cell = $getBlockElementNodeAtPoint(selection.focus)
          if ($isTableCellNode(cell)) {
            return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false)
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
      ({ nodes, selection }) => {
        if (!$isRangeSelection(selection)) return false

        const anchorCell = $getBlockElementNodeAtPoint(selection.anchor)
        if (!$isTableCellNode(anchorCell)) return false

        if (!selection.isCollapsed()) {
          const focusCell = $getBlockElementNodeAtPoint(selection.focus)
          if (focusCell?.is(anchorCell)) {
            $insertAsInlines(selection, anchorCell, nodes)
            return true
          }
        }

        const isSingleTable = nodes.length === 1 && $isTableNode(nodes[0])
        let grid: TableCellNode[][] | undefined
        if (isSingleTable) {
          const table = nodes[0] as TableNode
          grid = table.getChildren<TableRowNode>().map(row => row.getChildren<TableCellNode>())
        } else if ($isTableRowNode(nodes[0]) && nodes.every($isTableRowNode)) {
          grid = nodes.map(row => row.getChildren<TableCellNode>())
        } else if ($isTableCellNode(nodes[0]) && nodes.every($isTableCellNode)) {
          grid = [nodes as TableCellNode[]]
        }
        if (grid) {
          $copyToTable(anchorCell, grid).select(0, 0)
        } else {
          $insertAsInlines(selection, anchorCell, nodes)
        }
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    /* ------------------------------- Navigation ------------------------------- */
    editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      event => {
        const selection = $getSelection()
        return $handleNavigation(selection, event, "down")
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      event => {
        const selection = $getSelection()
        return $handleNavigation(selection, event, "up")
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_TAB_COMMAND,
      event => {
        const selection = $getSelection()
        return event.shiftKey
          ? $handleNavigation(selection, event, "left")
          : $handleNavigation(selection, event, "right")
      },
      COMMAND_PRIORITY_LOW,
    ),
    /* --------------------------------- Format --------------------------------- */
    editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      formatType => {
        const selection = $getSelection()
        if ($isTableSelection(selection)) {
          const cells = selection.getNodes() as TableCellNode[]
          const rangeSelection = $createRangeSelection()
          const anchor = rangeSelection.anchor
          const focus = rangeSelection.focus
          cells.forEach(cell => {
            anchor.set(cell.__key, 0, "element")
            focus.set(cell.__key, cell.getChildrenSize(), "element")
            rangeSelection.formatText(formatType)
          })
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    /* -------------------------------- Clipboard ------------------------------- */
    editor.registerCommand(
      COPY_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isTableSelection(selection)) {
          copyToClipboard(
            editor,
            objectKlassEquals(event, ClipboardEvent) ? (event as ClipboardEvent) : null,
            // Since the nodes contained in the selected cell are considered unselected,
            // we need to create a NodeSelection and recursively add all the nodes
            $getClipboardDataFromSelection(TableSelection.$toNodeSelection(selection)),
          )
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    /* ------------------------------ Context Menu ------------------------------ */
    editor.registerCommand(
      OPEN_CONTEXT_MENU_COMMAND,
      ({ items }) => {
        const selection = $getSelection()
        if ($isTableSelection(selection)) {
          items.push(
            {
              type: "separator",
            },
            {
              type: "item",
              title: "Merge Cells",
              action(editor) {
                editor.update(() => $mergeCells(selection).select())
              },
            },
            {
              type: "separator",
            },
            {
              type: "item",
              title: "Delete Row",
              action(editor) {
                editor.update(() => {
                  const { minRow, maxRow } = selection.getBoundary()
                  const table = $getNodeByKey<TableNode>(selection.tableKey)
                  if (table) $deleteRow(minRow, maxRow + 1, table)
                })
              },
            },
            {
              type: "item",
              title: "Delete Column",
              action(editor) {
                editor.update(() => {
                  const { minCol, maxCol } = selection.getBoundary()
                  const table = $getNodeByKey<TableNode>(selection.tableKey)
                  if (table) $deleteColumn(minCol, maxCol + 1, table)
                })
              },
            },
          )
          return true
        } else if ($isRangeSelection(selection)) {
          const cell = $getBlockElementNodeAtPoint(selection.focus)
          if ($isTableCellNode(cell)) {
            const table = $getTableFromCellOrThrow(cell)
            const isScrollable = table.getScrollable()
            items.push({ type: "separator" })
            if (cell.__colSpan > 1 || cell.__rowSpan > 1) {
              items.push(
                {
                  type: "item",
                  title: "Unmerge Cells",
                  action(editor) {
                    editor.update(() => $unmergeCells(cell, table))
                  },
                },
                {
                  type: "separator",
                },
              )
            }
            items.push(
              {
                type: "item",
                title: "Insert Row Above",
                action(editor) {
                  editor.update(() => {
                    const tableRow = $insertRow(cell, table, true)
                    tableRow.select(0, 0)
                  })
                },
              },
              {
                type: "item",
                title: "Insert Row Below",
                action(editor) {
                  editor.update(() => {
                    const tableRow = $insertRow(cell, table, false)
                    tableRow.select(0, 0)
                  })
                },
              },
              {
                type: "item",
                title: "Insert Column Left",
                action(editor) {
                  editor.update(() => {
                    const firstCell = $insertColumn(cell, table, true)
                    firstCell.select(0, 0)
                  })
                },
              },
              {
                type: "item",
                title: "Insert Column Right",
                action(editor) {
                  editor.update(() => {
                    const firstCell = $insertColumn(cell, table, false)
                    firstCell.select(0, 0)
                  })
                },
              },
              {
                type: "separator",
              },
              {
                type: "item",
                title: "Delete Row",
                action(editor) {
                  editor.update(() => {
                    const [row, _] = table.getCellCords(cell)!
                    $deleteRow(row, row + 1, table)
                  })
                },
              },
              {
                type: "item",
                title: "Delete Column",
                action(editor) {
                  editor.update(() => {
                    const [_, col] = table.getCellCords(cell)!
                    $deleteColumn(col, col + 1, table)
                  })
                },
              },
              {
                type: "separator",
              },
              {
                type: "item",
                title: "Reset Column Width",
                action(editor) {
                  editor.update(() => {
                    const [_, col] = table.getCellCords(cell)!
                    table.setColumnWidth(col, undefined)
                    cell.select()
                  })
                },
              },
              {
                type: "item",
                title: isScrollable ? "Fit Table to Document Width" : "Make Table Scrollable",
                action(editor) {
                  editor.update(() => {
                    table.setScrollable(!isScrollable)
                    cell.select()
                  })
                },
              },
            )
            return true
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
  )
}

/**
 * Replaces the sub table starting from the given cell with the provided grid.
 * If the grid is larger than the sub table, the extra cells will be ignored.
 * The operation will stop at the first cell that does not match the structure (colSpan/rowSpan) of the grid.
 *
 * @note We will not check if the grid is a valid table structure.
 */
function $copyToTable(startCell: TableCellNode, grid: TableCellNode[][]): TableCellNode {
  const tableMap = $getTableFromCellOrThrow(startCell).getTableMap()
  let { cell, row, col: startCol } = tableMap.cells[startCell.__key]
  const rows = Math.min(grid.length, tableMap.length - row)
  outer: for (let i = 0; i < rows; ++i) {
    const rowMap = tableMap[row]
    if (rowMap[startCol].col !== startCol) break

    let j = 0
    let col = startCol
    const gridRowSize = grid[i].length
    while (j < gridRowSize) {
      const value = rowMap[col]
      if (!value) break
      cell = value.cell
      if (value.row !== row) {
        // Skip the cell that spans multiple rows
        col += cell.__colSpan
        continue
      }
      const gridCell = grid[i][j]
      if (cell.__colSpan !== gridCell.__colSpan || cell.__rowSpan !== gridCell.__rowSpan) {
        break outer
      }
      cell.getChildren().forEach(n => n.remove())
      cell.append(...gridCell.getChildren())
      col += cell.__colSpan
      j += 1
    }
    row += 1
  }
  return cell
}
