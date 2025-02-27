import type { NodeMarkdownSerializer } from "#core/markdown"
import {
  type SerializedElementBlockNode,
  ElementBlockNode,
  $isElementBlock,
  $isDecoratorBlockNode,
} from "#core/nodes"
import { __assert__ } from "#shared/dev.ts"
import { $warpContinuosInlineNodes } from "#shared/node.ts"
import { $getBlockIfAtBlockEnd, $getBlockIfAtBlockStart } from "#shared/selection.ts"
import { $createListNode, $getListDepth, $isListNode, inferListTypeFromItem } from "./ListNode"
import {
  $createListParagraphNode,
  $isListParagraphNode,
  ListParagraphNode,
} from "./ListParagraphNode"
import {
  $createParagraphNode,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  ElementNode,
  LexicalNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type NodeKey,
  type RangeSelection,
  type Spread,
} from "lexical"
import type { Simplify } from "type-fest"

export type SerializedListItemNode = Simplify<
  Spread<
    {
      checked: boolean | undefined
      value: number | undefined
    },
    SerializedElementBlockNode
  >
>

export class ListItemNode extends ElementBlockNode {
  __value: number | undefined
  __checked: boolean | undefined

  static readonly attrChecked = "data-checked"

  static override getType(): string {
    return "listitem"
  }

  static override clone(node: ListItemNode): ListItemNode {
    return new ListItemNode(node.__value, node.__checked, node.__key)
  }

  constructor(value?: number, checked?: boolean, key?: NodeKey) {
    super(key)
    this.__value = value
    this.__checked = checked
  }

  getValue(): number | undefined {
    return this.getLatest().__value
  }

  setValue(value?: number): void {
    this.getWritable().__value = value
  }

  getChecked(): boolean | undefined {
    return this.getLatest().__checked
  }

  setChecked(checked: boolean | undefined): void {
    this.getWritable().__checked = checked
  }

  override canIndent(): boolean {
    return true
  }

  override getIndent(): number {
    const parent = this.getParent()
    return $isListNode(parent) ? $getListDepth(parent) : 0
    // note: this.__indent will always be 0
  }

  override setIndent(indentLevel: number): this {
    __assert__(indentLevel >= 0, "Indent level should be greater than or equal to 0")
    let currentIndent = this.getIndent()
    while (currentIndent !== indentLevel) {
      if (currentIndent < indentLevel) {
        // indent
        const prevSibling = this.getPreviousSibling()
        if (!$isListItemNode(prevSibling)) break
        const list = $createListNode(inferListTypeFromItem(this))
        list.append(this)
        prevSibling.append(list)
        currentIndent++
      } else {
        // outdent
        const list = this.getParent()
        if (!$isListNode(list)) break
        const parentListItem = list.getParent()
        __assert__(
          $isListItemNode(parentListItem),
          "When `currentIndent > 0`, parent list should be inside a listitem",
        )
        const nextSiblingItems = this.getNextSiblings()
        const nextListSiblings = list.getNextSiblings()
        parentListItem.insertAfter(this)
        const subList = $createListNode(list.__listType)
        subList.append(...nextSiblingItems)
        this.append(subList, ...nextListSiblings)
        currentIndent--
      }
    }
    return this
  }

  override extractWithChild(
    _child: LexicalNode,
    selection: BaseSelection | null,
    _destination: "clone" | "html",
  ): boolean {
    if (!$isRangeSelection(selection)) return false

    const anchor = selection.anchor
    const focus = selection.focus
    const [front, back] = anchor.isBefore(focus) ? [anchor, focus] : [focus, anchor]

    // If the selection is the entire content of the list item, extract this with children.
    const node = $getBlockIfAtBlockStart(front)
    if ($isListParagraphNode(node)) {
      const node = $getBlockIfAtBlockEnd(back)
      if (this.__last === node?.__key) {
        return true
      }
    }

    return false
  }

  override isParentRequired(): boolean {
    return true
  }

  override createParentElementNode(): ElementNode {
    // __trace__(ListItemNode, this.createParentElementNode, arguments)
    return $createListNode(inferListTypeFromItem(this))
  }

  override canMergeWhenEmpty(): boolean {
    return false
  }

  override canBeEmpty(): boolean {
    return false
  }

  override canInsertTextBefore(): boolean {
    return false
  }

  override canInsertTextAfter(): boolean {
    return false
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor, "li") as HTMLLIElement

    if (this.__checked !== undefined) {
      this.updateCheckedAttr(dom)
    }
    if (this.__value !== undefined) {
      dom.value = this.__value
    }

    const theme = config.theme.list?.listitem
    if (theme) dom.className = theme

    return dom
  }

  override updateDOM(prevNode: this, dom: HTMLLIElement, config: EditorConfig): boolean {
    super.updateDOM(prevNode, dom, config)

    if (this.__checked !== undefined) {
      this.updateCheckedAttr(dom)
    }
    if (this.__value !== undefined) {
      dom.value = this.__value
    }

    return false
  }

  updateCheckedAttr(dom: HTMLLIElement): void {
    if (this.__checked) {
      dom.setAttribute(ListItemNode.attrChecked, "true")
    } else {
      dom.setAttribute(ListItemNode.attrChecked, "false")
    }
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedListItemNode {
    return {
      ...super.exportJSON(),
      checked: this.getChecked(),
      value: this.getValue(),
      type: ListItemNode.getType(),
    }
  }

  static override importJSON(serializedNode: SerializedListItemNode): ListItemNode {
    const node = $createListItemNode(serializedNode.checked)
    node.setValue(serializedNode.value)
    return node
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("li")
    if (this.__checked !== undefined) {
      this.updateCheckedAttr(element)
    }
    return { element }
  }

  static override importDOM(): DOMConversionMap<HTMLLIElement> {
    return {
      li: () => ({
        conversion: element => {
          // normalizeExternalLiElement(element)
          const checked = element.getAttribute("aria-checked")
          const node = $createListItemNode(checked === null ? undefined : checked === "true")
          return { node }
        },
        priority: 0,
      }),
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = (_exportChildren, exportNode): string => {
    const indentLevel = this.getIndent()
    const indentation = "    ".repeat(indentLevel)
    let prefix: string
    if (this.__value !== undefined) {
      prefix = `${this.__value}.`
    } else if (this.__checked !== undefined) {
      prefix = `[${this.__checked ? "x" : " "}]`
    } else {
      prefix = "-"
    }

    const [paragraph, ...children] = this.getChildren()
    if (!paragraph) return `${indentation}${prefix} \n`

    let output = exportNode(paragraph) + "\n\n"
    const childIndentation = "    ".repeat(indentLevel + 1)
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if ($isListNode(child)) {
        output += exportNode(child)
      } else {
        output += exportNode(child).replace(/^/gm, `${childIndentation}`) + "\n\n"
      }
    }
    return `${indentation}${prefix} ${output}`
  }

  /* -------------------------------- Selection ------------------------------- */

  override select(anchorOffset?: number, focusOffset?: number): RangeSelection {
    // __trace__(ListItemNode, this.select, arguments)
    const childrenSize = this.getChildrenSize()
    if (
      (anchorOffset === undefined || anchorOffset === childrenSize) &&
      (focusOffset === undefined || focusOffset === childrenSize)
    ) {
      const lastChild = this.getLastChild()
      if ($isElementBlock(lastChild)) {
        return lastChild.select()
      } else if ($isDecoratorBlockNode(lastChild)) {
        return lastChild.selectEnd()
      }
    }
    return super.select(anchorOffset, focusOffset)
  }

  override selectStart(): RangeSelection {
    return this.select(0, 0)
  }

  override selectEnd(): RangeSelection {
    return this.select()
  }

  /* -------------------------------- Mutation -------------------------------- */

  override append(...nodes: LexicalNode[]): this {
    // __trace__(ListItemNode, this.append, arguments)
    super.append(...$warpContinuosInlineNodes(nodes, $createParagraphNode))
    return this
  }

  override insertAfter(node: LexicalNode, restoreSelection?: boolean): LexicalNode {
    // __trace__(ListItemNode, this.insertAfter, arguments)
    const list = this.getParent()
    if ($isListItemNode(node) || !$isListNode(list)) {
      return super.insertAfter(node, restoreSelection)
    }

    const nodeKey = this.getKey()
    if (list.__last === nodeKey) {
      list.insertAfter(node)
    } else {
      // Split the list
      const newList = $createListNode(list.getListType())
      const siblings = this.getNextSiblings()
      newList.append(...siblings)
      list.insertAfter(node, restoreSelection)
      node.insertAfter(newList, restoreSelection)
    }

    return node
  }

  override insertNewAfter(selection: RangeSelection, restoreSelection?: boolean): ListItemNode {
    const listItem = $createListItemNode(this.__checked === undefined ? undefined : false)
    this.insertAfter(listItem, restoreSelection)
    return listItem
  }

  override insertBefore(node: LexicalNode, restoreSelection?: boolean): LexicalNode {
    // __trace__(ListItemNode, this.insertBefore, arguments)
    const list = this.getParent()
    if ($isListItemNode(node) || !$isListNode(list)) {
      return super.insertBefore(node, restoreSelection)
    }

    const nodeKey = this.getKey()
    if (list.__first === nodeKey) {
      list.insertBefore(node)
    } else {
      // Split the list
      const newList = $createListNode(list.getListType())
      const siblings = this.getPreviousSiblings()
      newList.append(...siblings)
      list.insertBefore(node, restoreSelection)
      node.insertBefore(newList, restoreSelection)
    }

    return node
  }

  override replace<N extends LexicalNode>(replaceWith: N, includeChildren?: boolean): N {
    // __trace__(ListItemNode, this.replace, arguments)
    const list = this.getParent()
    const nodeKey = this.__key

    if ($isListNode(list)) {
      if (list.__first === nodeKey) {
        // at the start
        list.insertBefore(replaceWith)
      } else if (list.__last === nodeKey) {
        // at the end
        list.insertAfter(replaceWith)
      } else {
        // in the middle
        // Split the list
        const newList = $createListNode(list.getListType())
        const siblings = this.getNextSiblings()
        newList.append(...siblings)
        list.insertAfter(replaceWith)
        replaceWith.insertAfter(newList)
      }
    } else {
      this.insertAfter(replaceWith)
    }

    if (includeChildren) {
      __assert__($isElementNode(replaceWith), "Expected an element node")
      const [listParagraph, ...children] = this.getChildren()
      if (listParagraph) {
        __assert__(
          $isListParagraphNode(listParagraph),
          "The first child should be a ListParagraphNode",
        )
        replaceWith.append(...listParagraph.getChildren())
        let node: LexicalNode = replaceWith
        for (let i = 0; i < children.length; i++) {
          node.insertAfter(children[i])
          node = children[i]
        }
      }
    }

    this.remove()

    return replaceWith
  }

  override collapseAtStart(_selection: RangeSelection): boolean {
    const firstChild = this.getFirstChild<ListParagraphNode>()
    const paragraph = firstChild
      ? ListParagraphNode.toParagraph(firstChild)
      : $createParagraphNode()
    this.replace(paragraph, true)
    paragraph.select(0, 0)
    return true
  }

  static override transform(): (node: LexicalNode) => void {
    return (listItem: LexicalNode) => {
      // __trace__(ListItemNode, ListItemNode.transform, arguments)
      __assert__($isListItemNode(listItem), "Expected a ListItemNode")
      const firstChild = listItem.getFirstChild()
      if (!firstChild) {
        listItem.append($createListParagraphNode())
      } else if (!$isListParagraphNode(firstChild)) {
        if ($isParagraphNode(firstChild)) {
          const listParagraph = ListParagraphNode.from(firstChild)
          firstChild.replace(listParagraph, true)
        } else {
          const listParagraph = $createListParagraphNode()
          firstChild.insertBefore(listParagraph)
        }
      }
    }
  }
}

export function $isListItemNode(node: LexicalNode | null | undefined): node is ListItemNode {
  return node instanceof ListItemNode
}

export function $createListItemNode(checked?: boolean): ListItemNode {
  const listItem = new ListItemNode(undefined, checked)
  return listItem
}
