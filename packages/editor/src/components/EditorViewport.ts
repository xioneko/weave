import { h, type FunctionalComponent } from "vue"

export function getViewportElement(root: HTMLElement | null | undefined): HTMLElement {
  return (root?.closest("[data-editor-viewport]") as HTMLElement) ?? document.body
}

const EditorViewport: FunctionalComponent = (_, { slots }) => {
  return h(
    "div",
    { "data-editor-viewport": "", style: { position: "relative", overflow: "auto" } },
    slots.default?.(),
  )
}

export default EditorViewport
