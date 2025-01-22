import {
  $createTextNode,
  $isElementNode,
  type ElementNode,
  type LexicalNode,
  type RootNode,
} from "lexical"
import MarkdownIt from "markdown-it"
import Token from "markdown-it/lib/token.mjs"

export type MarkdownImportOptions = {}

export type MarkdownTokenParserMap = {
  [tokenType: string]: MarkdownTokenParser
}

export type TokenMapFn<T> = (token: Token, index: number, tokens: Token[]) => T

export type MarkdownTokenParser =
  | {
      type: "node"
      /**
       * return `null` to ignore the node
       */
      createNode: TokenMapFn<LexicalNode | null>
    }
  | {
      type: "format"
      getFormat: TokenMapFn<number>
    }

export function $importFromMarkdown(
  root: ElementNode | RootNode,
  markdown: string,
  tokenParserMap: MarkdownTokenParserMap,
  markdownIt: MarkdownIt,
  _options: MarkdownImportOptions = {},
): void {
  const stack: {
    node: ElementNode | RootNode
    format: number
    ignoreUntil?: string
    ignore?: string
  }[] = [{ node: root, format: 0 }]

  function parseTokens(tokens: Token[]): void {
    for (let i = 0; i < tokens.length; ++i) {
      const token = tokens[i]
      let top = stack[stack.length - 1]

      if (top.ignoreUntil) {
        if (token.type === top.ignoreUntil) {
          top.ignoreUntil = undefined
        }
        continue
      }

      if (top.ignore && token.type === top.ignore) {
        top.ignore = undefined
        continue
      }

      if (token.type.endsWith("_open")) {
        const tokenTypePrefix = token.type.slice(0, -5)
        const parser = tokenParserMap[tokenTypePrefix]
        if (parser?.type === "node") {
          // open node
          const node = parser.createNode(token, i, tokens)
          if (!node) {
            top.ignore = tokenTypePrefix + "_close"
            continue
          }
          if (!$isElementNode(node)) {
            throw new Error(
              `Import markdown error: parser for "${tokenTypePrefix}" must return ElementNode or null`,
            )
          }
          stack.push({ node, format: 0 })
        } else if (parser?.type === "format") {
          // open format
          const format = parser.getFormat(token, i, tokens)
          top.format |= format
        } else {
          // ignore until close
          top.ignoreUntil = tokenTypePrefix + "_close"
        }
      } else if (token.type.endsWith("_close")) {
        const tokenTypePrefix = token.type.slice(0, -6)
        const parser = tokenParserMap[tokenTypePrefix]
        if (parser?.type === "node") {
          // close node and append to parent
          const { node } = stack.pop()!
          top = stack[stack.length - 1]
          top.node.append(node)
        } else if (parser?.type === "format") {
          // close format
          const format = parser.getFormat(token, i, tokens)
          top.format &= ~format
        }
      } else {
        const parser = tokenParserMap[token.type]
        if (parser) {
          switch (parser.type) {
            case "node": {
              // append node / element to parent
              const node = parser.createNode(token, i, tokens)
              if (node) top.node.append(node)
              break
            }
            case "format": {
              // append text node with format
              const format = parser.getFormat(token, i, tokens)
              const textNode = $createTextNode(token.content)
              textNode.setFormat(format)
              top.node.append(textNode)
              break
            }
          }
        } else if (token.type === "inline") {
          // parse inline tokens
          parseTokens(token.children!)
        } else if (token.type === "text") {
          // add text node
          const textNode = $createTextNode(token.content)
          textNode.setFormat(top.format)
          top.node.append(textNode)
        }
      }
    }
  }

  const tokens = markdownIt.parse(markdown, {})
  parseTokens(tokens)
}
