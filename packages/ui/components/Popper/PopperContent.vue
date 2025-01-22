<script lang="ts">
interface PopperContentContextValue {
  popperSide: Ref<PopperSide>
  arrow: Ref<HTMLElement | null>
  arrowX: Ref<number | undefined>
  arrowY: Ref<number | undefined>
  shouldHideArrow: Ref<boolean>
}

export interface PopperContentProps {
  strategy?: "fixed" | "absolute"

  side?: PopperSide
  align?: PopperAlign
  sideOffset?: number
  alignOffset?: number
  arrowPadding?: number
  hideWhenDetached?: boolean

  disableCollisionDetection?: boolean
  collisionBoundary?: Element[]
  collisionPadding?: number | Partial<Record<PopperSide, number>>

  autoUpdateOptions?: AutoUpdateOptions

  setPopperAvailableSizeCssVar?: boolean
  setAnchorSizeCssVar?: boolean
  setTransformOriginCssVar?: boolean
}

export interface PopperContentEmits {
  positioned: [element: HTMLElement]
  placementChanged: [side: PopperSide, align: PopperAlign]
}

export const PopperContentCSSVar = {
  availableWidth: "--popper-available-width",
  availableHeight: "--popper-available-height",
  anchorWidth: "--popper-anchor-width",
  anchorHeight: "--popper-anchor-height",
  transformOrigin: "--popper-transform-origin",
}

export const PopperContentContext = Symbol(
  "PopperContentContext",
) as InjectionKey<PopperContentContextValue>

export type PopperSide = "top" | "right" | "bottom" | "left"
export type PopperAlign = "start" | "center" | "end"

function parsePlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-")
  return { side, align } as { side: PopperSide; align: PopperAlign }
}
</script>

<script setup lang="ts">
import el from "../shared/polymorphic"
import { useElementSize } from "../shared/useElementSize"
import { useForwardRef } from "../shared/useForwardRef"
import { PopperRootContext } from "./PopperRoot.vue"
import { PopperTransitionContext } from "./PopperTransition.vue"
import { transformOrigin } from "./middleware"
import {
  arrow,
  autoUpdate,
  AutoUpdateOptions,
  flip,
  hide,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
  type DetectOverflowOptions,
  type Middleware,
  type Placement,
  type UseFloatingReturn,
} from "@floating-ui/vue"
import {
  computed,
  inject,
  provide,
  ref,
  useTemplateRef,
  watch,
  type InjectionKey,
  type Ref,
} from "vue"

const {
  strategy = "absolute",
  side = "bottom",
  align = "center",
  sideOffset = 0,
  alignOffset = 0,
  arrowPadding = 0,
  disableCollisionDetection = false,
  collisionBoundary = [],
  collisionPadding = 0,
  hideWhenDetached = false,
  setAnchorSizeCssVar = false,
  setPopperAvailableSizeCssVar = false,
  setTransformOriginCssVar = false,
  autoUpdateOptions,
} = defineProps<PopperContentProps>()
defineOptions({
  inheritAttrs: false,
})
const emit = defineEmits<PopperContentEmits>()

const { anchor } = inject(PopperRootContext)!
const transitionCtx = inject(PopperTransitionContext, null)

const floatingRef = useTemplateRef("floatingKey")
const arrowRef = ref<HTMLElement | null>(null)
const [contentRef, forwardRef] = useForwardRef()

const { width: arrowWidth, height: arrowHeight } = useElementSize(arrowRef)

const desiredPlacement = computed(() => {
  return align === "center" ? side : (`${side}-${align}` as const)
})
const detectOverflowOptions = computed<DetectOverflowOptions>(() => {
  return {
    padding: collisionPadding,
    boundary: collisionBoundary,
  }
})

const middleware = computed(() => {
  return [
    offset({
      mainAxis: sideOffset + arrowHeight.value,
      alignmentAxis: alignOffset,
    }),
    !disableCollisionDetection &&
      shift({
        mainAxis: true,
        crossAxis: false,
        limiter: limitShift(),
        ...detectOverflowOptions.value,
      }),
    !disableCollisionDetection &&
      flip({
        ...detectOverflowOptions.value,
      }),
    size({
      ...detectOverflowOptions.value,
      apply: ({ elements, rects, availableHeight, availableWidth }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference
        const contentStyle = elements.floating.style
        if (setAnchorSizeCssVar) {
          contentStyle.setProperty(PopperContentCSSVar.anchorWidth, `${anchorWidth}px`)
          contentStyle.setProperty(PopperContentCSSVar.anchorHeight, `${anchorHeight}px`)
        }
        if (setPopperAvailableSizeCssVar) {
          contentStyle.setProperty(PopperContentCSSVar.availableWidth, `${availableWidth}px`)
          contentStyle.setProperty(PopperContentCSSVar.availableHeight, `${availableHeight}px`)
        }
      },
    }),
    arrow({
      element: arrowRef,
      padding: arrowPadding,
    }),
    setTransformOriginCssVar &&
      transformOrigin({ arrowWidth: arrowWidth.value, arrowHeight: arrowWidth.value }),
    hideWhenDetached &&
      hide({
        strategy: "referenceHidden",
        ...detectOverflowOptions.value,
      }),
  ] as Middleware[]
})

const { floatingStyles, placement, isPositioned, middlewareData } = useFloating(
  anchor,
  floatingRef,
  {
    strategy: strategy,
    placement: desiredPlacement,
    whileElementsMounted(referenceEl, floatingEl, update) {
      return autoUpdate(referenceEl, floatingEl, update, {
        ancestorScroll: false,
        ancestorResize: true,
        elementResize: false,
        layoutShift: false,
        animationFrame: false,
        ...autoUpdateOptions,
      })
    },
    middleware,
  },
) as UseFloatingReturn

const placedSide = computed(() => parsePlacement(placement.value).side)
const placedAlign = computed(() => parsePlacement(placement.value).align)
const shouldHideArrow = computed(() => middlewareData.value.arrow?.centerOffset !== 0)
const arrowX = computed(() => middlewareData.value.arrow?.x)
const arrowY = computed(() => middlewareData.value.arrow?.y)
const popperTransformOrigin = computed(() => {
  return setTransformOriginCssVar
    ? `${middlewareData.value.transformOrigin?.x ?? 0} ${middlewareData.value.transformOrigin?.y ?? 0}`
    : undefined
})

watch(
  isPositioned,
  positioned => {
    if (positioned) {
      const popperContent = contentRef.value!
      emit("positioned", popperContent)
      transitionCtx?.onEnter(popperContent)
      floatingRef.value!.style.zIndex = window.getComputedStyle(popperContent).zIndex
    }
  },
  { flush: "post" },
)

watch(
  placement,
  () => {
    emit("placementChanged", placedSide.value, placedAlign.value)
  },
  { flush: "post" },
)

provide(PopperContentContext, {
  popperSide: placedSide,
  arrow: arrowRef,
  arrowX,
  arrowY,
  shouldHideArrow,
})
</script>

<template>
  <div
    ref="floatingKey"
    :style="{
      ...floatingStyles,
      ...(middlewareData.hide?.referenceHidden && {
        visibility: 'hidden',
        pointerEvents: 'none',
      }),
    }"
  >
    <el.div
      :data-side="placedSide"
      :data-align="placedAlign"
      :ref="forwardRef"
      v-bind="$attrs"
      :style="{
        transformOrigin: popperTransformOrigin,
        opacity: isPositioned ? undefined : 0,
        pointerEvents: isPositioned ? undefined : 'none',
      }"
    >
      <slot />
    </el.div>
  </div>
</template>
