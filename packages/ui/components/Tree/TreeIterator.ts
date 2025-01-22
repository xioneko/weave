export interface TreeIteratorOptions<Item> {
  getChildren: (node: Item) => Item[]
  getKey: (node: Item) => PropertyKey
  shouldSkipChildren: (node: Item, children: Item[]) => boolean
}

export interface TreeIteratorValue<Item> {
  index: number
  itemKey: PropertyKey
  value: Item
  level: number
  parent: Item | null
  parentKey: PropertyKey | null
  children: Item[]
  skipChildren?: true
}

export class TreeIterator<Item> implements Iterator<TreeIteratorValue<Item>> {
  private stack: TreeIteratorValue<Item>[]
  private options: TreeIteratorOptions<Item>

  constructor(root: Item | Item[], options: TreeIteratorOptions<Item>) {
    if (Array.isArray(root)) {
      this.stack = root.map((value, index) => ({
        value,
        index,
        itemKey: options.getKey(value),
        level: 0,
        parent: null,
        parentKey: null,
        children: options.getChildren(value),
      }))
    } else {
      this.stack = [
        {
          value: root,
          index: 0,
          itemKey: options.getKey(root),
          level: 0,
          parent: null,
          parentKey: null,
          children: options.getChildren(root),
        },
      ]
    }
    this.options = options
  }

  next(): IteratorResult<TreeIteratorValue<Item>> {
    if (this.stack.length === 0) {
      return { done: true, value: undefined }
    }
    const current = this.stack.pop()!
    if (current.children.length > 0) {
      const skipChildren = this.options.shouldSkipChildren(current.value, current.children)
      if (skipChildren) {
        current.skipChildren = true
      } else {
        for (let i = current.children.length - 1; i >= 0; i--) {
          const itemValue = current.children[i]
          this.stack.push({
            value: itemValue,
            index: i,
            itemKey: this.options.getKey(itemValue),
            level: current.level + 1,
            parent: current.value,
            parentKey: current.itemKey,
            children: this.options.getChildren(itemValue),
          })
        }
      }
    }
    return { done: false, value: current }
  }

  [Symbol.iterator](): IterableIterator<TreeIteratorValue<Item>> {
    return this
  }
}
