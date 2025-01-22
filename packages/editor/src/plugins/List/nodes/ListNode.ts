import type { NodeMarkdownSerializer } from "#core/markdown"
import { type SerializedElementBlockNode } from "#core/nodes"
import { __assert__, __trace__ } from "#shared/dev.ts"
import { $createListItemNode, $isListItemNode, type ListItemNode } from "./ListItemNode"
import { $isListParagraphNode } from "./ListParagraphNode"
import {
  ElementNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type EditorThemeClasses,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type Spread,
} from "lexical"
import type { Simplify } from "type-fest"

export type SerializedListNode = Simplify<
  Spread<
    {
      listType: ListType
      start: number
      tag: ListNodeTagType
    },
    SerializedElementBlockNode
  >
>

export type ListType = "number" | "bullet" | "check"

export type ListNodeTagType = "ol" | "ul"

export class ListNode extends ElementNode {
  __tag: ListNodeTagType
  __start: number
  __listType: ListType
  static readonly attrListType = "data-list-type"

  static override getType(): string {
    return "list"
  }

  static override clone(node: ListNode): ListNode {
    return new ListNode(node.__listType, node.__start, node.__key)
  }

  constructor(listType: ListType = "bullet", start: number = 1, key?: NodeKey) {
    super(key)

    this.__listType = listType
    this.__tag = this.__listType === "number" ? "ol" : "ul"
    this.__start = start
  }

  getTag(): ListNodeTagType {
    return this.__tag
  }

  getListType(): ListType {
    return this.getLatest().__listType
  }

  setListType(listType: ListType): void {
    const self = this.getWritable()
    self.__listType = listType
    self.__tag = listType === "number" ? "ol" : "ul"
  }

  getStart(): number {
    return this.__start
  }

  override canBeEmpty(): boolean {
    return false
  }

  override canInsertTextAfter(): boolean {
    return false
  }

  override canInsertTextBefore(): boolean {
    return false
  }

  override extractWithChild(
    child: LexicalNode,
    _selection: BaseSelection | null,
    _destination: "clone" | "html",
  ): boolean {
    // __trace__(ListNode, this.extractWithChild, arguments)
    return $isListItemNode(child)
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    // __trace__(ListNode, this.createDOM, arguments)
    const dom = document.createElement(this.__tag)

    if (this.__listType === "number") {
      ;(dom as HTMLOListElement).start = this.__start
      dom.style.setProperty("--list-start", this.__start.toString())
    }

    $setListThemeClassNames(dom, config.theme, this)
    return dom
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    // __trace__(ListNode, this.updateDOM, arguments)
    if (prevNode.__tag !== this.__tag) {
      return true
    }
    $setListThemeClassNames(dom, config.theme, this)
    return false
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedListNode {
    const self = this.getLatest()
    return {
      ...super.exportJSON(),
      type: ListNode.getType(),
      listType: self.__listType,
      start: self.__start,
      tag: self.__tag,
    }
  }

  static override importJSON(serializedNode: SerializedListNode): ListNode {
    return $createListNode(serializedNode.listType, serializedNode.start).updateFromJSON(
      serializedNode,
    )
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement(this.__tag)
    element.setAttribute(ListNode.attrListType, this.__listType)
    return { element }
  }

  static override importDOM(): DOMConversionMap {
    return {
      ol: () => ({
        conversion: $convertListElement,
        priority: 0,
      }),
      ul: () => ({
        conversion: $convertListElement,
        priority: 0,
      }),
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = exportChildren => {
    return exportChildren(this, { blockSuffix: "" })
  }

  /* -------------------------------- Mutation -------------------------------- */

  override append(...nodes: LexicalNode[]): this {
    // __trace__(ListNode, this.append, arguments)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if ($isListItemNode(node)) {
        super.append(node)
      } else {
        const listItem = $createListItemNode(this.__listType === "check" ? false : undefined)
        listItem.append(node)
        super.append(listItem)
      }
    }
    return this
  }

  static override transform(): (node: LexicalNode) => void {
    return (list: LexicalNode) => {
      __assert__($isListNode(list), "Expected a ListNode")
      $normalizeList(list)
    }
  }
}

export function $isListNode(node: LexicalNode | null | undefined): node is ListNode {
  return node instanceof ListNode
}

export function $createListNode(listType: ListType, start: number = 1): ListNode {
  return new ListNode(listType, start)
}

export function inferListTypeFromItem(item: ListItemNode): ListType {
  if (item.__checked !== undefined) return "check"
  if (item.__value !== undefined) return "number"
  return "bullet"
}

export function $getListDepth(list: ListNode): number {
  let depth = 0
  let parent = list.getParent()
  while ($isListItemNode(parent)) {
    depth++
    const list = parent.getParent()
    __assert__($isListNode(list), "Parent of ListItemNode should be a ListNode")
    parent = list.getParent()
  }
  return depth
}

function $setListThemeClassNames(
  dom: HTMLElement,
  classes: EditorThemeClasses,
  list: ListNode,
): void {
  const theme = classes.list
  if (theme) {
    let className = ""

    const listClass = theme[list.__tag]
    if (listClass) className += listClass

    const checklistClass = theme.checklist
    if (list.__listType === "check" && checklistClass) {
      className += ` ${checklistClass}`
    }

    const listDepthClasses = theme[`${list.__tag}Depth`] ?? []
    const level = $getListLevel(list)
    const depthClass = listDepthClasses[level % listDepthClasses.length]
    if (depthClass) className += ` ${depthClass}`

    if (className) dom.className = className
  }
}

function $getListLevel(list: ListNode): number {
  let level = 0
  let parent: ElementNode | null | undefined = list.getParent()
  const listType = list.getListType()
  while (
    $isListItemNode(parent) &&
    // Make sure the lists are not separated by other nodes such as paragraphs
    $isListParagraphNode(list.getPreviousSibling())
  ) {
    ;(list as ListNode | null) = parent.getParent()
    if (list.__listType !== listType) break
    level++
    parent = list?.getParent()
  }
  return level
}

function $convertListElement(domNode: HTMLElement): DOMConversionOutput {
  const nodeName = domNode.nodeName.toLowerCase()
  let node: ListNode | null = null
  switch (nodeName) {
    case "ol":
      const start = domNode.getAttribute("start")
      node = $createListNode("number", parseInt(start || "1"))
      break
    case "ul":
      if (domNode.getAttribute(ListNode.attrListType) === "check") {
        node = $createListNode("check")
      } else {
        node = $createListNode("bullet")
      }
  }
  return { node }
}

function $normalizeList(list: ListNode) {
  // 1. remove empty list
  if (list.isEmpty()) {
    list.remove()
    return
  }

  // 2. Merge adjacent lists with the same type
  const nextSibling = list.getNextSibling()
  if ($isListNode(nextSibling) && nextSibling.getListType() === list.getListType()) {
    list.append(...nextSibling.getChildren())
    nextSibling.remove()
  }

  // 3. Update ListItem properties
  const listType = list.getListType()
  const children = list.getChildren()
  if (listType === "number") {
    const start = list.getStart()
    children.forEach((child, index) => {
      __assert__($isListItemNode(child), "Expected a ListItemNode child")
      const val = start + index
      if (child.__value !== val) {
        child.setValue(val)
      }
      if (child.__checked !== undefined) {
        child.setChecked(undefined)
      }
    })
  } else if (listType === "bullet") {
    children.forEach(child => {
      __assert__($isListItemNode(child), "Expected a ListItemNode child")
      if (child.__value !== undefined) {
        child.setValue(undefined)
      }
      if (child.__checked !== undefined) {
        child.setChecked(undefined)
      }
    })
  } /* check */ else {
    children.forEach(child => {
      __assert__($isListItemNode(child), "Expected a ListItemNode child")
      if (child.__checked == undefined) {
        child.setChecked(false)
      }
    })
  }
}
