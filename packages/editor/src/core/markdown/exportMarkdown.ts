import { $isNonInlineNode } from "#shared/node.ts"
import {
  $isDecoratorNode,
  $isElementNode,
  $isLineBreakNode,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
  type RootNode,
  type TextNode,
} from "lexical"

declare module "lexical" {
  interface LexicalNode {
    exportMarkdown?: NodeMarkdownSerializer
  }
}

export type NodeMarkdownSerializer = (
  exportChildren: (node: ElementNode, options?: ExportChildrenOptions) => string,
  exportNode: (node: LexicalNode) => string,
  exportText: (node: TextNode, content?: string) => string,
) => string

export type TextFormatTagMap = Record<number, TextFormatTagSpec>

export type TextFormatTagSpec = {
  tag: string
}

export type ExportChildrenOptions = {
  linePrefix?: string
  blockSuffix?: string
}

export type MarkdownExportOptions = {}

export function $exportAsMarkdown(
  root: ElementNode | RootNode,
  textFormatSerializerMap: TextFormatTagMap,
  _options: MarkdownExportOptions = {},
): string {
  function exportChildren(node: ElementNode, options: ExportChildrenOptions = {}): string {
    const { linePrefix = "", blockSuffix = "\n\n" } = options
    let out = ""
    const children = node.getChildren()
    for (let i = 0; i < children.length; ++i) {
      const node = children[i]
      let output = exportNode(node)
      if ($isNonInlineNode(node)) output += blockSuffix
      out += output
    }
    if (linePrefix) out = out.replace(/^/gm, linePrefix)
    return out
  }

  function exportNode(node: LexicalNode): string {
    if (node.exportMarkdown) {
      return node.exportMarkdown(exportChildren, exportNode, exportText)
    }

    if ($isLineBreakNode(node)) {
      return "\n"
    }

    if ($isElementNode(node)) {
      return exportChildren(node)
    }
    if ($isDecoratorNode(node)) {
      return node.getTextContent()
    }
    if ($isTextNode(node)) {
      return exportText(node)
    }
    return ""
  }

  const unclosedTags: string[] = [] // From outermost to innermost

  function exportText(node: TextNode, content: string = node.getTextContent()): string {
    // (<b> foo </b>) ==> ( **foo** ),  =/=> (** foo **)
    let trimmed = content.trim()
    if (!trimmed) return content // Text node with only spaces

    let openTags = ""
    let closeTags = ""
    const nextText = getTextSibling(node, false)

    let boundary = Infinity
    let format = node.getFormat()
    let flag = 1
    while (format) {
      if (format & 1) {
        const serializer = textFormatSerializerMap[flag]
        if (serializer) {
          const tag = serializer.tag
          let tagIndex = unclosedTags.indexOf(tag)

          const canJoinPrev = tagIndex !== -1
          const canJoinNext =
            nextText && nextText.getTextContent().trim() && hasFormat(nextText, flag)

          if (!canJoinPrev) {
            unclosedTags.push(tag)
            tagIndex = unclosedTags.length - 1
            openTags += tag
          }

          if (!canJoinNext) {
            // The boundary tag is the outermost tag that should be closed
            boundary = Math.min(boundary, tagIndex)
          }
        }
      }
      format >>= 1
      flag <<= 1
    }

    while (unclosedTags.length > boundary) {
      // close tags inside the boundary
      closeTags += unclosedTags.pop()!
    }

    return content.replace(trimmed, openTags + trimmed + closeTags)
  }

  return exportChildren(root)
}

function getTextSibling(node: TextNode, backward: boolean): TextNode | null {
  let sibling = backward ? node.getPreviousSibling() : node.getNextSibling()

  if (!sibling) {
    const parent = node.getParentOrThrow()
    if (parent.isInline()) {
      sibling = backward ? parent.getPreviousSibling() : parent.getNextSibling()
    }
  }

  while (sibling) {
    if ($isTextNode(sibling)) {
      return sibling
    }
    if ($isElementNode(sibling)) {
      if (!sibling.isInline()) {
        return null
      }
      const descendant = backward ? sibling.getLastDescendant() : sibling.getFirstDescendant()
      if ($isTextNode(descendant)) {
        return descendant
      }
      // Skip element node that has no text
      sibling = backward ? sibling.getPreviousSibling() : sibling.getNextSibling()
    } else {
      return null
    }
  }

  return null
}

function hasFormat(text: TextNode, format: number): boolean {
  return (text.getFormat() & format) !== 0
}
