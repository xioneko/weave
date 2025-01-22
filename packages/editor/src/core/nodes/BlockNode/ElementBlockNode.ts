import {
  type BaseBlockNode,
  normalizeBlockDOM,
  $selectPrevious,
  $selectNext,
  updateSelectedAttr,
} from "./BaseBlockNode"
import { $isBlockSelection } from "./BlockSelection"
import {
  ElementNode,
  type BaseSelection,
  type EditorConfig,
  type LexicalEditor,
  type RangeSelection,
  type SerializedElementNode,
} from "lexical"

export type SerializedElementBlockNode = SerializedElementNode

export class ElementBlockNode extends ElementNode implements BaseBlockNode {
  __blokSelected: boolean = false

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
    this.__blokSelected = prevNode.__blokSelected
  }

  constructor(key?: string) {
    super(key)
  }

  override isSelected(selection?: null | BaseSelection): boolean {
    if ($isBlockSelection(selection)) {
      return this.__blokSelected
    }
    return super.isSelected(selection)
  }

  override isInline(): false {
    return false
  }

  override canIndent(): boolean {
    return false
  }

  override createDOM(config: EditorConfig, editor: LexicalEditor, tag?: string): HTMLElement {
    const dom = document.createElement(tag ?? "div")
    updateSelectedAttr(dom, this.__blokSelected)
    return normalizeBlockDOM(dom, editor)
  }

  override updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    updateSelectedAttr(dom, this.__blokSelected)
    return false
  }

  override selectPrevious(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectPrevious(this, anchorOffset, focusOffset)
  }

  override selectNext(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectNext(this, anchorOffset, focusOffset)
  }
}
