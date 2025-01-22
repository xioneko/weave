import {
  inject,
  provide,
  toValue,
  watchPostEffect,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref,
} from "vue"

export type ItemsGetter<ItemData extends object = {}> = ReturnType<
  ReturnType<typeof createCollection<ItemData>>["injectCollection"]
>

type ItemsGetterOptions = { ordered?: boolean; cached?: boolean }

export function createCollection<ItemData extends object = {}>() {
  type ItemsMap = Map<HTMLElement, { el: HTMLElement; data: ItemData }>

  const CollectionContext = Symbol("CollectionContext") as InjectionKey<ItemsMap>

  let __cachedItems: { el: HTMLElement; data: ItemData }[] | null = null

  // This function should usually be used in event handlers, so `ItemsMap` doesn't need to be a reactive state
  function getItems(provider: ItemsMap, options: ItemsGetterOptions = {}) {
    const { ordered = false, cached = true } = options
    if (cached && __cachedItems) return __cachedItems
    if (!provider) return []

    const items = Array.from(provider.values())
    if (ordered) {
      items.sort((a, b) =>
        a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      if (cached) __cachedItems = items
    }
    return items
  }

  function provideCollection() {
    const itemsMap = new Map<HTMLElement, { el: HTMLElement; data: ItemData }>()
    provide(CollectionContext, itemsMap)
    return (options?: ItemsGetterOptions) => getItems(itemsMap, options)
  }

  function injectCollection() {
    const itemsMap = inject(CollectionContext)!
    return (options?: ItemsGetterOptions) => getItems(itemsMap, options)
  }

  // Use this function at the top level of the setup function
  function useCollect(itemRef: Ref<HTMLElement | null>, data: MaybeRefOrGetter<ItemData>) {
    const itemsMap = inject(CollectionContext)!
    watchPostEffect(onCleanup => {
      const el = itemRef.value
      if (el) {
        itemsMap.set(el, { el, data: toValue(data) })
        __cachedItems = null
        onCleanup(() => {
          itemsMap.delete(el)
          __cachedItems = null
        })
      }
    })
  }

  return { provideCollection, injectCollection, useCollect }
}
