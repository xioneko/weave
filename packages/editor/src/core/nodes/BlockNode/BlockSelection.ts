import { type BaseBlockNode } from "./BaseBlockNode"
import {
  $createNodeSelection,
  $getNodeByKey,
  $isElementNode,
  $isTextNode,
  isCurrentlyReadOnlyMode,
  type BaseSelection,
  type LexicalNode,
  type NodeKey,
  type NodeSelection,
  type RangeSelection,
} from "lexical"

export class BlockSelection implements BaseSelection {
  _blocks: Set<NodeKey>

  _cachedNodes: LexicalNode[] | null

  dirty: boolean

  constructor(blocks: Set<NodeKey>) {
    this._blocks = blocks
    this._cachedNodes = null
    this.dirty = false
  }

  getCachedNodes(): LexicalNode[] | null {
    return this._cachedNodes
  }

  setCachedNodes(nodes: LexicalNode[] | null): void {
    this._cachedNodes = nodes
  }

  is(selection: null | BaseSelection): boolean {
    if (!$isBlockSelection(selection)) {
      return false
    }
    const thisBlocks = this._blocks
    const otherBlocks = selection._blocks
    return thisBlocks.isSubsetOf(otherBlocks) && otherBlocks.isSubsetOf(thisBlocks)
  }

  isCollapsed(): false {
    return false
  }

  isBackward(): false {
    return false
  }

  getStartEndPoints(): null {
    return null
  }

  add(...blocks: BaseBlockNode[]): void {
    this.dirty = true
    for (let i = 0; i < blocks.length; i++) {
      this._blocks.add(blocks[i].getKey())
    }
    this._cachedNodes = null
  }

  delete(...blocks: BaseBlockNode[]): void {
    this.dirty = true
    for (let i = 0; i < blocks.length; i++) {
      this._blocks.delete(blocks[i].getKey())
    }
    this._cachedNodes = null
  }

  replace(block: BaseBlockNode, newBlock: BaseBlockNode): void {
    this.dirty = true
    this._blocks.delete(block.getKey())
    this._blocks.add(newBlock.getKey())
    this._cachedNodes = null
  }

  clear(): void {
    this.dirty = true
    this._blocks.clear()
    this._cachedNodes = null
  }

  has(blockKey: NodeKey): boolean {
    return this._blocks.has(blockKey)
  }

  clone(): BlockSelection {
    return new BlockSelection(new Set(this._blocks))
  }

  extract(): BaseBlockNode[] {
    return this.getNodes()
  }

  insertRawText(_text: string): void {}

  insertText(_text: string): void {}

  insertNodes(nodes: LexicalNode[]): void {
    const selectedNodes = this.getNodes()
    const selectedNodesLength = selectedNodes.length
    const lastSelectedNode = selectedNodes[selectedNodesLength - 1]
    let selectionAtEnd: RangeSelection
    // Insert nodes
    if ($isTextNode(lastSelectedNode)) {
      selectionAtEnd = lastSelectedNode.select()
    } else {
      const index = lastSelectedNode.getIndexWithinParent() + 1
      selectionAtEnd = lastSelectedNode.getParentOrThrow().select(index, index)
    }
    selectionAtEnd.insertNodes(nodes)
    // Remove selected nodes
    for (let i = 0; i < selectedNodesLength; i++) {
      selectedNodes[i].remove()
    }
  }

  getNodes(): BaseBlockNode[] {
    if (this._cachedNodes) {
      return this._cachedNodes as BaseBlockNode[]
    }
    const blocks: BaseBlockNode[] = []
    this._blocks.forEach(key => {
      const node = $getNodeByKey(key)
      if (node) {
        blocks.push(node as BaseBlockNode)
      }
    })
    if (!isCurrentlyReadOnlyMode()) {
      this._cachedNodes = blocks
    }
    return blocks
  }

  getTextContent(): string {
    const blocks = this.getNodes()
    let text = ""
    for (let i = 0; i < blocks.length; i++) {
      text += blocks[i].getTextContent()
    }
    return text
  }

  static $toNodeSelection(selection: BlockSelection): NodeSelection {
    const nodeSelection = $createNodeSelection()
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

export function $isBlockSelection(
  selection: BaseSelection | null | undefined,
): selection is BlockSelection {
  return selection instanceof BlockSelection
}

export function $createBlockSelection(): BlockSelection {
  return new BlockSelection(new Set())
}
