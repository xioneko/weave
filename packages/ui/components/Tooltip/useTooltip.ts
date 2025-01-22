import { transformOrigin } from "../Popper/middleware"
import { createGlobalComposable, createSharedComposable } from "../shared/createSharedComposable"
import {
  computePosition,
  flip,
  offset,
  shift,
  arrow as floatingUiArrow,
  type Padding,
} from "@floating-ui/dom"
import { ref, watch, onScopeDispose, type ObjectDirective, type CSSProperties } from "vue"

interface UseTooltipOptions {
  // Position
  strategy?: "fixed" | "absolute"
  // Delay (ms)
  showDelay?: number
  hideDelay?: number
  // Styles
  className?: string
  classNameText?: string
  classNameArrow?: string
  // Arrow
  showArrow?: boolean
  arrowSize?: { width: number; height: number }
  /**
   * Set to `true` to use `clip-path` property to create a triangle shape
   */
  arrowClipPath?: boolean
  // Placement
  defaultSide?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  boundaryPadding?: Padding
  // Animation
  setTransformOrigin?: boolean
  onEnter?: (el: HTMLElement) => void
  onLeave?: (el: HTMLElement, done: () => void) => void
}

type vTooltipValue = string | showTooltipOptions
type showTooltipOptions = {
  content: string
  side?: "top" | "bottom" | "left" | "right"
}
type vTooltipModifiers = NonNullable<showTooltipOptions["side"]>

type UseTooltipReturn = {
  vTooltip: ObjectDirective<HTMLElement, vTooltipValue, vTooltipModifiers>
  // Imperative APIs
  show: (anchor: HTMLElement | null, options: showTooltipOptions) => void
  hide: () => void
  toggle: (anchor: HTMLElement | null, options: showTooltipOptions) => void
}

export const useTooltip = (options: UseTooltipOptions = {}): UseTooltipReturn => {
  const {
    strategy = "fixed",
    showDelay = 0,
    hideDelay = 0,
    className = "v-tooltip",
    classNameText = "v-tooltip-text",
    classNameArrow = "v-tooltip-arrow",
    showArrow = false,
    arrowSize = { width: 10, height: 10 },
    arrowClipPath = false,
    defaultSide = "top",
    sideOffset = 0,
    boundaryPadding = 0,
    setTransformOrigin = false,
    onEnter,
    onLeave,
  } = options
  const activeAnchor = ref<HTMLElement | null>(null)
  const desiredSide = ref(defaultSide)

  const floatingElem = createFloatingElement(strategy)
  const tooltip = createDefaultTooltipElement(className, classNameText)
  floatingElem.appendChild(tooltip)
  const arrow: HTMLElement | null = showArrow
    ? createDefaultArrowElement(classNameArrow, arrowSize, arrowClipPath)
    : null
  if (arrow) tooltip.appendChild(arrow)

  let showTimer: number | undefined = undefined
  let hideTimer: number | undefined = undefined

  const resetTimer = () => {
    window.clearTimeout(showTimer)
    window.clearTimeout(hideTimer)
  }

  const showTooltip = (anchor: HTMLElement | null, options: showTooltipOptions, delay?: number) => {
    if (!anchor) return
    resetTimer()
    const show = () => {
      activeAnchor.value = anchor
      desiredSide.value = options.side ?? defaultSide
      const textSlot = tooltip.querySelector(`.${classNameText}`)
      if (textSlot) textSlot.innerHTML = options.content
    }
    if (delay !== undefined) {
      showTimer = window.setTimeout(show, showDelay)
    } else {
      show()
    }
  }

  const hideTooltip = (delay?: number) => {
    resetTimer()
    const hide = () => {
      activeAnchor.value = null
    }
    if (delay !== undefined) {
      hideTimer = window.setTimeout(hide, hideDelay)
    } else {
      hide()
    }
  }

  watch(activeAnchor, async anchor => {
    if (anchor) {
      anchor.ownerDocument.body.appendChild(floatingElem)
      const { x, y, placement, middlewareData } = await computePosition(anchor, floatingElem, {
        placement: desiredSide.value,
        strategy,
        middleware: [
          offset(sideOffset + (showArrow ? arrowSize.height : 0)),
          flip({ padding: boundaryPadding }),
          shift({ padding: boundaryPadding }),
          arrow &&
            floatingUiArrow({
              element: arrow,
            }),
          setTransformOrigin &&
            transformOrigin({ arrowWidth: arrowSize.width, arrowHeight: arrowSize.height }),
        ],
      })
      floatingElem.style.transform = `translate(${x}px, ${y}px)`

      if (arrow && middlewareData.arrow) {
        const { x, y } = middlewareData.arrow
        const side = placement.split("-")[0]

        const arrowSide = {
          top: "bottom",
          bottom: "top",
          left: "right",
          right: "left",
        }[side]!

        const arrowTransform = {
          top: "rotate(45deg)",
          bottom: "rotate(-135deg)",
          right: "rotate(135deg)",
          left: "rotate(-45deg)",
        }[side]!

        Object.assign(arrow.style, {
          position: "fixed",
          left: x !== undefined ? `${x}px` : "",
          top: y !== undefined ? `${y}px` : "",
          [arrowSide]: `${-arrowSize.height / 2}px`,
          transform: arrowTransform,
          visibility: middlewareData.arrow?.centerOffset !== 0 ? "hidden" : undefined,
        } satisfies CSSProperties)
      }

      if (setTransformOrigin) {
        tooltip.style.transformOrigin = [
          middlewareData.transformOrigin?.x,
          middlewareData.transformOrigin?.y,
        ].join(" ")
      }

      // Transform animation should NOT be applied on the floating element
      onEnter?.(tooltip)
    } else {
      if (onLeave) {
        onLeave(tooltip, () => floatingElem.remove())
      } else {
        floatingElem.remove()
      }
    }
  })

  onScopeDispose(() => {
    resetTimer()
    floatingElem.remove()
  })

  const directive: ObjectDirective<HTMLElement, vTooltipValue, vTooltipModifiers> = {
    mounted: (anchor, binding) => {
      const side = Object.keys(binding.modifiers)[0] as vTooltipModifiers | undefined
      const options: showTooltipOptions =
        typeof binding.value === "string"
          ? { content: binding.value, side }
          : Object.assign(binding.value, { side })
      const show = () => showTooltip(anchor, options, showDelay)
      const hide = () => hideTooltip(hideDelay)
      anchor.addEventListener("mouseenter", show)
      anchor.addEventListener("mouseleave", hide)
      // @ts-expect-error
      anchor["__vTooltip"] = {
        cleanup: () => {
          anchor.removeEventListener("mouseenter", show)
          anchor.removeEventListener("mouseleave", hide)
        },
      }
    },
    unmounted: anchor => {
      // @ts-expect-error
      anchor["__vTooltip"].cleanup()
    },
  }
  return {
    vTooltip: directive,
    // Imperative api will ignore the delay
    show: (anchor, options) => showTooltip(anchor, options),
    hide: () => hideTooltip(),
    toggle: (anchor, options) => {
      if (activeAnchor.value === anchor) {
        hideTooltip(0)
      } else {
        showTooltip(anchor, options, 0)
      }
    },
  }
}

export const useSharedTooltip = createSharedComposable(useTooltip)

export const useTooltipSingleton = createGlobalComposable(useTooltip)

function createFloatingElement(strategy: "fixed" | "absolute") {
  const floatingElem = document.createElement("div")
  Object.assign(
    floatingElem.style,
    // Important for computing the tooltip position
    {
      position: strategy,
      width: "max-content",
      top: "0",
      left: "0",
    } satisfies CSSProperties,
  )
  return floatingElem
}

function createDefaultTooltipElement(className: string, classNameText: string) {
  const textSlot = document.createElement("div")
  textSlot.className = classNameText
  textSlot.setAttribute("data-tooltip-text", "")

  const tooltip = document.createElement("div")
  tooltip.className = className
  tooltip.style.pointerEvents = "none"

  tooltip.appendChild(textSlot)

  return tooltip
}

function createDefaultArrowElement(
  className: string,
  size: { width: number; height: number },
  clipPath: boolean,
) {
  const arrow = document.createElement("span")
  arrow.className = className
  arrow.style.width = `${size.width}px`
  arrow.style.height = `${size.height}px`
  if (clipPath) arrow.style.clipPath = "polygon(100% 0, 0 100%, 100% 100%)"
  return arrow
}
