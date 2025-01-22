import { ref, toValue, watch, type MaybeRef, type Ref } from "vue"

type MapReadonlyRef<T> = {
  readonly [K in keyof T]: Readonly<Ref<T[K]>>
}

export type BorderBoxSize = {
  width: number
  height: number
}

export function useElementSize(
  element: MaybeRef<HTMLElement | null>,
  initialSize: BorderBoxSize = { width: 0, height: 0 },
): MapReadonlyRef<BorderBoxSize> {
  const width = ref(initialSize.width)
  const height = ref(initialSize.height)

  watch(
    () => toValue(element),
    (el, _, onCleanup) => {
      width.value = el?.offsetWidth ?? initialSize.width
      height.value = el?.offsetHeight ?? initialSize.height

      if (el) {
        const observer = new ResizeObserver(entries => {
          const borderBox = entries[0]?.borderBoxSize?.[0]
          width.value = borderBox.inlineSize ?? el.offsetWidth
          height.value = borderBox.blockSize ?? el.offsetHeight
        })
        observer.observe(el, { box: "border-box" })

        onCleanup(() => observer.disconnect())
      }
    },
    { immediate: true },
  )

  return { width, height }
}
