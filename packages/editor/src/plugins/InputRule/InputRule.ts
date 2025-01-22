import type { TextFormatType, LexicalEditor, TextNode } from "lexical"

export type InputRule =
  | {
      type: "format"
      tag: string
      format: number | TextFormatType
      spaceAfter?: boolean
      priority?: number
    }
  | {
      type: "node"
      /**
       * @returns `false` if the input rule is not applied
       */
      transform: (node: TextNode, offset: number, editor: LexicalEditor) => false | void
      priority?: number
    }
