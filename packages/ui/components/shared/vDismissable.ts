import { computed, shallowReactive, watch, type ObjectDirective, type ShallowReactive } from "vue"

export type vDismissableValue = {
  /**
   * set `true` to make the element layer isolated from lower layers (or document body), which is useful for modal
   */
  disableOutsidePointerEvents?: boolean
  // Assuming the following callbacks are stable
  onEscapeKeyDown?: (element: HTMLElement) => void
  onPointerDownOutside?: (element: HTMLElement, target: Element) => void
  onFocusOutside?: (element: HTMLElement, target: Element) => void
  // When using onBlur, the element's tabindex will be set to -1 to make it focusable
  onBlur?: (element: HTMLElement, relatedTarget: Node | null) => void
}

const dismissableLayers = new WeakMap<Document, ShallowReactive<DismissableLayer[]>>()

const originalBodyPointerEvents = new WeakMap<Document, string>()

interface DismissableLayer {
  element: HTMLElement
  isolated: boolean
}

/**
 * @note value passed to the directive should be stable
 */
export const vDismissable: ObjectDirective<HTMLElement, vDismissableValue> = {
  mounted(element, binding) {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onBlur,
    } = binding.value
    const layers = getOrPut(dismissableLayers, document)
    const currentLayer: DismissableLayer = {
      element,
      isolated: disableOutsidePointerEvents,
    }

    if (disableOutsidePointerEvents && layers.length === 0) {
      originalBodyPointerEvents.set(document, document.body.style.pointerEvents)
      document.body.style.pointerEvents = "none"
    }

    layers.push(currentLayer)

    const noIsolationAboveCurrentLayer = computed(
      () =>
        layers.findLast(layer => layer.element === element || layer.isolated)?.element === element,
    )

    const __stop1 = watch(
      noIsolationAboveCurrentLayer,
      (so, _, onCleanup) => {
        if (so) {
          if (onPointerDownOutside) {
            const handlePointerDown = (event: PointerEvent) => {
              if (element.contains(event.target as Element)) return
              onPointerDownOutside(element, event.target as Element)
            }
            element.ownerDocument.addEventListener("pointerdown", handlePointerDown, true)
            onCleanup(() => {
              element.ownerDocument.removeEventListener("pointerdown", handlePointerDown, true)
            })
          }

          if (onFocusOutside) {
            const handleFocusIn = (event: FocusEvent) => {
              if (element.contains(event.target as Element)) return
              onFocusOutside(element, event.target as Element)
            }
            element.ownerDocument.addEventListener("focusin", handleFocusIn, true)
            onCleanup(() => {
              element.ownerDocument.removeEventListener("focusin", handleFocusIn, true)
            })
          }

          if (onBlur) {
            const handleBlur = (event: FocusEvent) => {
              if (element.contains(event.relatedTarget as Node | null)) return
              onBlur(element, event.relatedTarget as Node | null)
            }
            element.setAttribute("tabindex", "-1")
            element.addEventListener("blur", handleBlur, true)
            onCleanup(() => {
              element.removeAttribute("tabindex")
              element.removeEventListener("blur", handleBlur, true)
            })
          }

          element.style.pointerEvents = "auto"
          onCleanup(() => {
            element.style.pointerEvents = ""
          })
        }
      },
      { immediate: true },
    )

    const isCurrentLayerOnTop = computed(() => layers[layers.length - 1] === currentLayer)

    const __stop2 = watch(
      isCurrentLayerOnTop,
      (so, _, onCleanup) => {
        if (so) {
          if (onEscapeKeyDown) {
            const handleKeyDown = (event: KeyboardEvent) => {
              if (event.key === "Escape") {
                onEscapeKeyDown(element)
              }
            }

            element.ownerDocument.addEventListener("keydown", handleKeyDown)
            onCleanup(() => {
              element.ownerDocument.removeEventListener("keydown", handleKeyDown)
            })
          }
        }
      },
      { immediate: true },
    )

    // @ts-expect-error
    element["__vDismissable"] = {
      cleanup: () => {
        __stop1()
        __stop2()
      },
    }
  },
  unmounted(el, binding) {
    const layers = dismissableLayers.get(el.ownerDocument)!
    layers.splice(
      layers.findIndex(layer => layer.element === el),
      1,
    )
    const isolationLayers = layers.filter(layer => layer.isolated)
    if (binding.value.disableOutsidePointerEvents && isolationLayers?.length === 0) {
      document.body.style.pointerEvents = originalBodyPointerEvents.get(document) ?? ""
      originalBodyPointerEvents.delete(document)
    }
    if (layers.length === 0) {
      dismissableLayers.delete(el.ownerDocument)
    }
    // @ts-expect-error
    el["__vDismissable"].cleanup()
  },
}

function getOrPut(map: WeakMap<Document, ShallowReactive<DismissableLayer[]>>, key: Document) {
  let value = map.get(key)
  if (!value) {
    // we need to compare th layer elements by reference
    value = shallowReactive([])
    map.set(key, value)
  }
  return value
}
