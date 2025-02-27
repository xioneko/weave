import { $isDecoratorNode } from "#core/nodes"
import { getOrPut } from "./utils"
import {
  type DecoratorNode,
  $isElementNode,
  type ElementNode,
  type LexicalNode,
  type NodeKey,
  type TextNode,
  type LineBreakNode,
  $createLineBreakNode,
  $createTextNode,
  $isLineBreakNode,
  LexicalEditor,
} from "lexical"
import type { Klass } from "lexical"

export function $isNonInlineNode(
  node: LexicalNode | null | undefined,
): node is ElementNode | DecoratorNode<any> {
  return ($isElementNode(node) || $isDecoratorNode(node)) && !node.isInline()
}

export function $isInlineNode(
  node: LexicalNode | null | undefined,
): node is TextNode | ElementNode | DecoratorNode<any> | LineBreakNode {
  return !$isNonInlineNode(node)
}

export function $findMatchingSibling<T extends LexicalNode>(
  startingNode: LexicalNode,
  predicate: (node: LexicalNode) => node is T,
  isBackward = false,
): T | null {
  let current: LexicalNode | null = startingNode
  while (current) {
    if (predicate(current)) return current
    current = isBackward ? current.getPreviousSibling() : current.getNextSibling()
  }
  return null
}

// Reference: https://github.com/facebook/lexical/blob/2b4252d9360e1196199f0709fdf25974b64d5e6f/packages/lexical/src/LexicalUtils.ts#L488
export function getNodeKeyFromDOMNode(dom: Node, editor: LexicalEditor): NodeKey | undefined {
  const prop = `__lexicalKey_${editor._key}`
  const nodeKey = (dom as Node & Record<typeof prop, NodeKey | undefined>)[prop]
  return nodeKey
}

export function $wrapNodeIfRequired(node: LexicalNode): LexicalNode {
  while (node.isParentRequired()) {
    const parent = node.createParentElementNode()
    parent.append(node)
    node = parent
  }
  return node
}

export function $warpContinuosInlineNodes(
  nodes: LexicalNode[],
  createWrapper: () => ElementNode,
): LexicalNode[] {
  const result: LexicalNode[] = []
  let inlineNodes: LexicalNode[] = []
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i]
    if ($isNonInlineNode(node)) {
      if (inlineNodes.length > 0) {
        result.push(createWrapper().append(...inlineNodes))
        inlineNodes = []
      }
      result.push(node)
    } else {
      inlineNodes.push(node)
    }
  }
  if (inlineNodes.length > 0) {
    result.push(createWrapper().append(...inlineNodes))
  }
  return result
}

export function $transformToInlines(
  nodes: LexicalNode[],
  allowLineBreak: boolean = true,
): LexicalNode[] {
  const inlineNodes = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if ($isInlineNode(node)) {
      if (allowLineBreak || !$isLineBreakNode(node)) {
        inlineNodes.push(node)
      } else {
        node.remove()
      }
    } else if ($isElementNode(node)) {
      inlineNodes.push(...$transformToInlines(node.getChildren()))
      node.remove()
      if (allowLineBreak) {
        const lastChild = inlineNodes[inlineNodes.length - 1]
        if (!$isLineBreakNode(lastChild) && i !== nodes.length - 1) {
          inlineNodes.push($createLineBreakNode())
        }
      }
    } else {
      inlineNodes.push($createTextNode(node.getTextContent()))
      node.remove()
    }
  }
  return inlineNodes
}

const registeredElements = new WeakMap<LexicalEditor, Map<NodeKey, Element>>()

export type NodeElementMutationListener = (
  mutation:
    | {
        type: "created"
        nodeKey: NodeKey
        element: HTMLElement
      }
    | {
        type: "destroyed"
        nodeKey: NodeKey
      },
) => void

export function registerNodeElementMutationListener(
  editor: LexicalEditor,
  klass: Klass<LexicalNode>,
  listener: NodeElementMutationListener,
) {
  const elementsMap = getOrPut(registeredElements, editor, () => new Map())
  return editor.registerMutationListener(klass, mutations => {
    mutations.forEach((mutation, nodeKey) => {
      if (mutation !== "destroyed") {
        const element = editor.getElementByKey(nodeKey)!
        const registered = elementsMap.get(nodeKey)
        if (element && registered !== element) {
          if (registered) listener({ nodeKey, type: "destroyed" })
          elementsMap.set(nodeKey, element)
          listener({ nodeKey, type: "created", element })
        }
      } else {
        listener({ nodeKey, type: "destroyed" })
      }
    })
  })
}
