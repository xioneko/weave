import { TreeIterator, type TreeIteratorValue } from './TreeIterator'

export interface TreeStoreOptions<Item> {
  getKey: (item: Item) => PropertyKey
  getChildren: (item: Item) => Item[]
}

export interface ItemInfo<Item> {
  value: Item
  itemKey: PropertyKey
  children: Item[]
  parent: ItemInfo<Item> | null
}

export class TreeStore<Item> {
  private root: Item[]
  private options: TreeStoreOptions<Item>
  private nodesMap: Map<PropertyKey, ItemInfo<Item>>
  constructor(
    root: Item | Item[],
    options: TreeStoreOptions<Item> = {
      getKey: (item) => (item as any).id,
      getChildren: (item) => (item as any).children ?? [],
    },
  ) {
    this.options = options
    this.root = Array.isArray(root) ? root : [root]
    this.nodesMap = new Map()
    this.root.forEach((item) => this.buildMap(item, null))
  }

  private buildMap(item: Item, parent: ItemInfo<Item> | null): void {
    const key = this.options.getKey(item)
    const node = {
      value: item,
      itemKey: key,
      children: this.options.getChildren(item),
      parent,
    }
    this.nodesMap.set(key, node)
    const children = this.options.getChildren(item)
    children.forEach((child) => this.buildMap(child, node))
  }

  public getItem(key: PropertyKey): ItemInfo<Item> | undefined {
    return this.nodesMap.get(key)
  }

  public getAllChildren(key: PropertyKey): TreeIteratorValue<Item>[] {
    const node = this.nodesMap.get(key)
    if (!node) return []
    return Array.from(
      new TreeIterator(node.value, {
        getChildren: (node) => this.options.getChildren(node),
        getKey: (node) => this.options.getKey(node),
        shouldSkipChildren: () => false,
      }),
    )
  }

  public removeItem(key: PropertyKey): boolean {
    const node = this.nodesMap.get(key)
    if (!node) return false
    const parent = node.parent
    if (!parent) {
      const index = this.root.indexOf(node.value)
      if (index === -1) return false
      this.root.splice(index, 1)
    } else {
      const children = parent.children
      const index = children.indexOf(node.value)
      if (index === -1) return false
      children.splice(index, 1)
    }
    this.nodesMap.delete(key)
    return true
  }

  public appendChild(parentKey: PropertyKey, child: Item): boolean {
    const parent = this.nodesMap.get(parentKey)
    if (!parent) return false
    parent.children.push(child)
    this.buildMap(child, parent)
    return true
  }

  public insertBefore(beforeKey: PropertyKey, item: Item): boolean {
    const node = this.nodesMap.get(beforeKey)
    if (!node) return false
    const parent = node.parent
    if (!parent) {
      const index = this.root.indexOf(node.value)
      if (index === -1) return false
      this.root.splice(index, 0, item)
    } else {
      const children = parent.children
      const index = children.indexOf(node.value)
      if (index === -1) return false
      children.splice(index, 0, item)
    }
    this.buildMap(item, parent)
    return true
  }

  public insertAfter(afterKey: PropertyKey, item: Item): boolean {
    const node = this.nodesMap.get(afterKey)
    if (!node) return false
    const parent = node.parent
    if (!parent) {
      const index = this.root.indexOf(node.value)
      if (index === -1) return false
      this.root.splice(index + 1, 0, item)
    } else {
      const children = parent.children
      const index = children.indexOf(node.value)
      if (index === -1) return false
      children.splice(index + 1, 0, item)
    }
    this.buildMap(item, parent)
    return true
  }

  public getPathToItem(key: PropertyKey): PropertyKey[] {
    const path: PropertyKey[] = []
    let node = this.nodesMap.get(key) as ItemInfo<Item> | undefined | null
    while (node) {
      path.unshift(node.itemKey)
      node = node.parent
    }
    return path
  }

  public moveItem(
    sourceKey: PropertyKey,
    targetKey: PropertyKey,
    position: 'before' | 'after' | 'child',
  ): boolean {
    const node = this.nodesMap.get(sourceKey)
    if (!node) return false
    if (!this.removeItem(sourceKey)) return false
    switch (position) {
      case 'before':
        return this.insertBefore(targetKey, node.value)
      case 'after':
        return this.insertAfter(targetKey, node.value)
      case 'child':
        return this.appendChild(targetKey, node.value)
      default:
        return false
    }
  }
}
