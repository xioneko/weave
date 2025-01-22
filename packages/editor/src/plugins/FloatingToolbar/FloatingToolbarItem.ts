import { Toggle } from "@weave/ui/components/Toggle"
import { Format } from "@weave/ui/icons"
import { FORMAT_TEXT_COMMAND, type LexicalEditor, type RangeSelection } from "lexical"
import { h, ref, type Component, type FunctionalComponent, type PropType } from "vue"

export type FloatingToolbarItem = {
  id: string
  component: Component
  onUpdate?: (selection: RangeSelection) => void
}

export const ToolbarItem: FunctionalComponent<Pick<FloatingToolbarItem, "component">> = props => {
  return h(props.component)
}

ToolbarItem.props = {
  component: {
    type: Function as any as PropType<Component>,
    required: true,
  },
}

export function getDefaultFloatingToolbarItems(editor: LexicalEditor): FloatingToolbarItem[] {
  const isBold = ref(false)
  const isItalic = ref(false)
  const isUnderline = ref(false)
  const isStrikethrough = ref(false)
  const isSubscript = ref(false)
  const isSuperscript = ref(false)
  const isCode = ref(false)
  return [
    {
      id: "Bold",
      component: function BoldToggle() {
        return h(
          Toggle,
          {
            modelValue: isBold.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
            },
          },
          () => h(Format.Bold, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isBold.value = selection.hasFormat("bold")
      },
    },
    {
      id: "Italic",
      component: function ItalicToggle() {
        return h(
          Toggle,
          {
            modelValue: isItalic.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
            },
          },
          () => h(Format.Italic, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isItalic.value = selection.hasFormat("italic")
      },
    },
    {
      id: "Underline",
      component: function UnderlineToggle() {
        return h(
          Toggle,
          {
            modelValue: isUnderline.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
            },
          },
          () => h(Format.Underline, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isUnderline.value = selection.hasFormat("underline")
      },
    },
    {
      id: "Strikethrough",
      component: function StrikethroughToggle() {
        return h(
          Toggle,
          {
            modelValue: isStrikethrough.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
            },
          },
          () => h(Format.Strikethrough, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isStrikethrough.value = selection.hasFormat("strikethrough")
      },
    },
    {
      id: "Subscript",
      component: function SubscriptToggle() {
        return h(
          Toggle,
          {
            modelValue: isSubscript.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
            },
          },
          () => h(Format.Subscript, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isSubscript.value = selection.hasFormat("subscript")
      },
    },
    {
      id: "Superscript",
      component: function SuperscriptToggle() {
        return h(
          Toggle,
          {
            modelValue: isSuperscript.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
            },
          },
          () => h(Format.Superscript, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isSuperscript.value = selection.hasFormat("superscript")
      },
    },
    {
      id: "Code",
      component: function CodeToggle() {
        return h(
          Toggle,
          {
            modelValue: isCode.value,
            "onUpdate:modelValue": () => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
            },
          },
          () => h(Format.Code, { width: "100%", height: "100%" }),
        )
      },
      onUpdate(selection) {
        isCode.value = selection.hasFormat("code")
      },
    },
  ]
}
