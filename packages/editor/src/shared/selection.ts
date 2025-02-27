import { __assert__ } from "./dev"
import { $transformToInlines } from "./node"
import { $findMatchingParent } from "@lexical/utils"
import {
  $createRangeSelection,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
  type Point,
  type RangeSelection,
} from "lexical"

export function $getBlockIfAtBlockStart(point: Point): ElementNode | null {
  if (point.offset !== 0) return null

  const node = point.getNode()
  if ($isElementNode(node) && !node.isInline()) {
    return node
  }

  let parent = node.getParent()
  let childKey = point.key
  while (parent) {
    if (parent.__first !== childKey) return null
    if ($isElementNode(parent) && !parent.isInline()) return parent
    childKey = parent.__key
    parent = parent.getParent()
  }
  return null
}

export function $getBlockIfAtBlockEnd(point: Point): ElementNode | null {
  const node = point.getNode()
  if (point.type === "text" && point.offset !== node.getTextContentSize()) return null

  if ($isElementNode(node) && !node.isInline()) {
    return point.offset === node.getChildrenSize() ? node : null
  }

  let parent = node.getParent()
  let childKey = point.key
  while (parent) {
    if (parent.__last !== childKey) return null
    if ($isElementNode(parent) && !parent.isInline()) return parent
    childKey = parent.__key
    parent = parent.getParent()
  }

  return null
}

export function $isAtBlockStart(point: Point): boolean {
  return $getBlockIfAtBlockStart(point) !== null
}

export function $isAtBlockEnd(point: Point): boolean {
  return $getBlockIfAtBlockEnd(point) !== null
}

export function $isAtNodeEnd(point: Point): boolean {
  if (point.type === "text") {
    return point.offset === point.getNode().getTextContentSize()
  }
  const node = point.getNode() as ElementNode
  return point.offset === node.getChildrenSize()
}

export function $getElementNodeAtPoint(point: Point): ElementNode | null {
  const nodeAtPoint = point.getNode()
  const node = point.type === "text" ? nodeAtPoint.getParent() : nodeAtPoint
  return $isElementNode(node) ? node : null
}

export function $getBlockElementNodeAtPoint(point: Point): ElementNode | null {
  let node: LexicalNode | null = point.getNode()
  while (node && !($isElementNode(node) && !node.isInline())) {
    node = node.getParent()
  }
  return node as ElementNode | null
}

export function $splitNodeAtPoint(
  node: LexicalNode,
  offset: number,
): [parent: ElementNode, offset: number] {
  const parent = node.getParent()
  __assert__($isElementNode(parent), "Expected a ElementNode parent")

  const index = node.getIndexWithinParent()
  if (offset === 0) {
    return [parent, index]
  }

  if ($isTextNode(node)) {
    if (offset !== node.getTextContentSize()) {
      node.splitText(offset)
    }
    return [parent, index + 1]
  }

  if (!$isElementNode(node)) {
    return [parent, index]
  }

  const firstToAppend = node.getChildAtIndex(offset)
  if (firstToAppend) {
    const selection = $createRangeSelection()
    selection.anchor.set(node.__key, offset, "element")
    selection.focus.set(node.__key, offset, "element")
    const newElement = node.insertNewAfter(selection)
    if (newElement) {
      __assert__(
        $isElementNode(newElement),
        "Node returned by ElementNode#insertNewAfter should be an ElementNode",
      )
      newElement.append(firstToAppend, ...firstToAppend.getNextSiblings())
    }
  }
  return [parent, index + 1]
}

export function $tryInsertBlock<T extends LexicalNode>(
  block: T,
  selection = $getSelection(),
): T | null {
  if (selection === null) {
    const root = $getRoot()
    root.append(block)
    return block
  }

  if ($isRangeSelection(selection)) {
    selection.removeText()
    const node = $getBlockElementNodeAtPoint(selection.anchor)
    if (node) {
      if ($isParagraphNode(node) && node.isEmpty()) {
        node.replace(block)
      } else {
        node.insertAfter(block)
      }
      return block
    }
  } else {
    const nodes = selection.getNodes()
    const lastNode = nodes[nodes.length - 1]
    const node = $findMatchingParent(lastNode, n => $isElementNode(n) && !n.isInline())
    if (node) {
      if ($isParagraphNode(node) && node.isEmpty()) {
        node.replace(block)
      } else {
        node.insertAfter(block)
      }
      return block
    }
  }

  return null
}

export function $insertAsInlines(
  selection: RangeSelection,
  parent: ElementNode,
  nodes: LexicalNode[],
): void {
  selection.removeText()
  let node = selection.anchor.getNode()
  let offset = selection.anchor.offset
  while (node.__key !== parent.__key) {
    ;[node, offset] = $splitNodeAtPoint(node, offset)
  }
  const afterNode = parent.getChildAtIndex(offset)
  const inlineNodes = $transformToInlines(nodes)
  if (afterNode) {
    inlineNodes.forEach(n => afterNode.insertBefore(n))
    afterNode.selectStart()
  } else {
    parent.append(...inlineNodes)
    parent.select()
  }
}
