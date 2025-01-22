<script setup lang="ts">
import { useComposerContext } from "#components/EditorComposer.vue"
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import SlashMenu, { SlashMenuPluginApi } from "#plugins/SlashMenu"
import { getNodeKeyFromDOMNode, registerNodeElementMutationListener } from "#shared/node.ts"
import { $getBlockElementNodeAtPoint } from "#shared/selection.ts"
import { $createTableSelectionFrom } from "./TableSelection"
import {
  $getNearestCellFromDOMNode,
  $getTableFromCellOrThrow,
  $isTableCellNode,
  TableCellNode,
  TableNode,
} from "./nodes"
import { INSERT_TABLE_COMMAND, registerTable } from "./registerTable"
import { mergeRegister } from "@lexical/utils"
import { Table } from "@weave/ui/icons"
import {
  $getNodeByKey,
  $isParagraphNode,
  $setSelection,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import { onUnmounted, ref } from "vue"

const { editor } = useComposerContext()
const { registerPluginMountedHook } = usePluginsHostContext()
const cleanupFns = new Map<NodeKey, () => void>()
let activeCell: TableCellNode | null = null
let anchorCell: TableCellNode | null = null
const isResizing = ref(false)

function updateResizerPosition(resizer: HTMLElement) {
  if (!activeCell) return
  const cellElem = editor.getElementByKey(activeCell.__key)
  if (cellElem) {
    resizer.style.left = `${cellElem.offsetLeft + cellElem.offsetWidth}px`
  }
}

const handleTablePointerDown = (event: PointerEvent) => {
  editor.read(() => {
    const cell = $getNearestCellFromDOMNode(event.target as Node)
    if (!$isTableCellNode(cell)) return
    anchorCell = cell
    const handlePointerUp = () => (anchorCell = null)
    window.addEventListener("pointerup", handlePointerUp, { once: true, capture: true })
  })
}

const handlePointerOver = (event: PointerEvent) => {
  if (isResizing.value) return
  editor.read(() => {
    const cell = $getNearestCellFromDOMNode(event.target as Node)
    if (!$isTableCellNode(cell)) return
    activeCell = cell

    const containerElem = event.currentTarget as HTMLElement
    const resizer = containerElem.querySelector(":scope > [data-resizer]") as HTMLElement

    if (
      anchorCell &&
      activeCell !== anchorCell &&
      $getTableFromCellOrThrow(anchorCell) === $getTableFromCellOrThrow(activeCell)
    ) {
      // Handle Table Selection
      const focusCell = activeCell
      const _anchorCell = anchorCell
      editor.update(() => {
        const table = $getTableFromCellOrThrow(cell)
        const tableSelection = $createTableSelectionFrom(table, _anchorCell, focusCell)
        $setSelection(tableSelection)
        editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined)
      })
      resizer.style.left = ""
      return
    }

    updateResizerPosition(resizer)
  })
}

const handleResizerPointerDown = (event: PointerEvent) => {
  if (!activeCell) return
  event.stopPropagation()
  event.preventDefault()

  const resizer = event.currentTarget as HTMLElement
  const table = editor.read(() => {
    const dom = resizer.parentElement!
    const key = getNodeKeyFromDOMNode(dom, editor)!
    return $getNodeByKey<TableNode>(key)!
  })

  const [_, startCol] = editor.read(() => table.getCellCords(activeCell!)!)
  const col = startCol + activeCell.__colSpan - 1
  const containerElem = editor.getElementByKey(table.__key)!
  const colElem = containerElem.querySelector<HTMLElement>(
    `table > colgroup > col:nth-child(${col + 1})`,
  )
  if (!colElem) return

  const originalCursor = document.body.style.cursor
  document.body.style.cursor = "col-resize"
  resizer.setAttribute("data-resizing", "")
  isResizing.value = true

  const startX = event.clientX
  const startWidth = colElem.style.width ? parseFloat(colElem.style.width) : colElem.offsetWidth
  let endWidth = startWidth

  let frameId: number | undefined
  const handlePointerMove = (event: PointerEvent) => {
    if (frameId) return
    frameId = requestAnimationFrame(() => {
      const delta = event.clientX - startX
      const newWidth = Math.max(startWidth + delta, 36)
      resizer.style.left = `${colElem.offsetLeft + colElem.offsetWidth}px`
      colElem.style.width = `${newWidth}px`
      endWidth = newWidth
      frameId = undefined
    })
  }

  const handlePointerUp = () => {
    isResizing.value = false
    if (endWidth !== startWidth) {
      editor.update(() => {
        ;(table as TableNode).setColumnWidth(col, endWidth)
      })
    }
    document.body.style.cursor = originalCursor
    resizer.removeAttribute("data-resizing")
    document.removeEventListener("pointermove", handlePointerMove)
  }

  document.addEventListener("pointermove", handlePointerMove)
  document.addEventListener("pointerup", handlePointerUp, { once: true })
}

onUnmounted(
  mergeRegister(
    registerTable(editor),
    registerPluginMountedHook<SlashMenuPluginApi>(SlashMenu.id, plugin => {
      const cleanup = plugin.registerItems({
        id: "table",
        title: "Table",
        icon: Table,
        action(editor, selection) {
          editor.update(() => {
            const block = $getBlockElementNodeAtPoint(selection.anchor)
            if (block) {
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: 3, columns: 3, after: block })
              if (block.isEmpty() && $isParagraphNode(block)) {
                block.remove()
              }
            }
          })
        },
      })
      cleanupFns.set(SlashMenu.id, cleanup)
    }),
    registerNodeElementMutationListener(editor, TableNode, mutation => {
      if (mutation.type === "created") {
        const { element: containerElem, nodeKey } = mutation
        const tableElem = containerElem.querySelector("table")!
        const resizer = containerElem.querySelector("[data-resizer]") as HTMLElement
        containerElem.addEventListener("pointerover", handlePointerOver)
        tableElem.addEventListener("pointerdown", handleTablePointerDown)
        resizer.addEventListener("pointerdown", handleResizerPointerDown)
        const table = editor.read(() => $getNodeByKey<TableNode>(nodeKey))!
        editor.update(() => table.recomputeTableMap())
        // TODO: Maybe we use one observer for the all tables
        const mutationObserver = new MutationObserver(records => {
          if (
            records.some(record => {
              const nodeName = record.target.nodeName
              return nodeName === "TABLE" || nodeName === "TR"
            })
          ) {
            editor.update(() => table.recomputeTableMap())
          }
        })
        mutationObserver.observe(tableElem, { childList: true, subtree: true })
        const resizeObserver = new ResizeObserver(() => {
          // When resizing, we will use pointermove event to update the resizer position
          if (!isResizing.value) {
            // Reason for why we use setTimeout：https://stackoverflow.com/a/77591424/19594295
            window.setTimeout(() => updateResizerPosition(resizer), 0)
          }
        })
        resizeObserver.observe(tableElem)

        cleanupFns.set(nodeKey, () => {
          mutationObserver.disconnect()
          resizeObserver.disconnect()
          containerElem.removeEventListener("pointerover", handlePointerOver)
          tableElem.removeEventListener("pointerdown", handleTablePointerDown)
          resizer.removeEventListener("pointerdown", handleResizerPointerDown)
        })
      } /* mutation.type === 'destroyed' */ else {
        cleanupFns.get(mutation.nodeKey)!()
        cleanupFns.delete(mutation.nodeKey)
      }
    }),
    () => {
      cleanupFns.forEach(fn => fn())
    },
  ),
)
</script>

<template></template>
