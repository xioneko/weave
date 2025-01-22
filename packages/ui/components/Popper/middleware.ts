import type { Middleware } from '@floating-ui/dom'

export const transformOrigin = (options: {
  arrowWidth: number
  arrowHeight: number
}): Middleware => ({
  name: 'transformOrigin',
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data

    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0
    const isArrowHidden = cannotCenterArrow

    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight
    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2

    const [side, align = 'center'] = placement.split('-')
    const noArrowAlign = { start: '0%', center: '50%', end: '100%' }[align]

    let x, y
    switch (side) {
      case 'bottom':
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`
        y = `-${arrowHeight}px`
        break
      case 'top':
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`
        y = `${rects.floating.height + arrowHeight}px`
        break
      case 'right':
        x = `-${arrowHeight}px`
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`
        break
      case 'left':
        x = `${rects.floating.width + arrowHeight}px`
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`
        break
    }
    return { data: { x, y } }
  },
})
