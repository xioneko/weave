import { __assert__ } from "#shared/dev.ts"
import { $isDecoratorBlockNode } from "./DecoratorBlockNode"
import { ElementBlockNode } from "./ElementBlockNode"
import type { ParagraphBlockNode } from "./ParagraphBlockNode"
import {
  type LexicalNode,
  ParagraphNode,
  type LexicalEditor,
  $getNearestNodeFromDOMNode,
  $getEditor,
  type RangeSelection,
  $createParagraphNode,
  $isRootNode,
} from "lexical"

export const BlockSelectedAttr = "data-block-selected"

export interface BaseBlockNode extends LexicalNode {
  __blokSelected: boolean

  isInline(): false

  selectPrevious(anchorOffset?: number, focusOffset?: number): RangeSelection

  selectNext(anchorOffset?: number, focusOffset?: number): RangeSelection
}

export function $isBlock(node: LexicalNode | null | undefined): node is BaseBlockNode {
  // ParagraphNode will be overridden by ParagraphBlockNode
  return (
    node instanceof ElementBlockNode || node instanceof ParagraphNode || $isDecoratorBlockNode(node)
  )
}

export type ElementBlock = ElementBlockNode | ParagraphBlockNode

export function $isElementBlock(node: LexicalNode | null | undefined): node is ElementBlock {
  return node instanceof ElementBlockNode || node instanceof ParagraphNode
}

export function normalizeBlockDOM(dom: HTMLElement, editor: LexicalEditor): HTMLElement {
  const key = editor.getKey()
  // @ts-expect-error
  dom[`__block_${key}`] = true
  dom.setAttribute("data-block", "")
  return dom
}

export function updateSelectedAttr(dom: HTMLElement, selected: boolean): void {
  if (selected) {
    dom.setAttribute(BlockSelectedAttr, "")
  } else {
    dom.removeAttribute(BlockSelectedAttr)
  }
}

export function $findClosestBlockFrom(
  target: HTMLElement,
): { node: BaseBlockNode; element: HTMLElement } | null {
  let el: HTMLElement | null | undefined = target
  const editor = $getEditor()
  const editorKey = editor.getKey()
  const blockKey = `__block_${editorKey}`
  const root = editor.getRootElement()
  while (el && el !== root) {
    // @ts-expect-error
    if (el[blockKey]) {
      const node = $getNearestNodeFromDOMNode(el)
      __assert__($isBlock(node))
      return { node, element: el }
    }
    el = el.parentElement
  }
  return null
}

/* -------------------------------- Selection ------------------------------- */

export function $selectPrevious(
  thisBlock: BaseBlockNode,
  anchorOffset?: number,
  focusOffset?: number,
): RangeSelection {
  const prevSibling = thisBlock.getPreviousSibling()
  if (prevSibling === null) {
    const parent = thisBlock.getParentOrThrow()
    if ($isRootNode(parent)) {
      // TODO: The behavior may change in the future
      return parent.select(0, 0)
    } else {
      return parent.selectPrevious(anchorOffset, focusOffset)
    }
  }
  if ($isElementBlock(prevSibling)) {
    return prevSibling.select(anchorOffset, focusOffset)
  }
  return prevSibling.selectEnd()
}

export function $selectNext(
  thisBlock: BaseBlockNode,
  anchorOffset?: number,
  focusOffset?: number,
): RangeSelection {
  const nextSibling = thisBlock.getNextSibling()
  if (nextSibling === null) {
    const parent = thisBlock.getParentOrThrow()
    if ($isRootNode(parent)) {
      // If thisBlock is the last block in the root node, append a new paragraph
      const paragraph = $createParagraphNode()
      parent.append(paragraph)
      return paragraph.select(0, 0)
    } else {
      return parent.selectNext(anchorOffset, focusOffset)
    }
  }
  if ($isElementBlock(nextSibling)) {
    return nextSibling.select(anchorOffset ?? 0, focusOffset ?? 0)
  }
  return nextSibling.selectStart()
}
