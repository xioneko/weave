import { faker } from '@faker-js/faker'

interface Tree {
  id: string
  fileName: string
  children: Tree[]
}

faker.seed(123)

export function generateTree(levels: number, maxChildren: number): Tree {
  const numChildren = faker.number.int({ min: 0, max: maxChildren })
  const children = []

  if (levels > 0) {
    for (let i = 0; i < numChildren; i++) {
      children.push(generateTree(levels - 1, maxChildren))
    }
  }
  return {
    id: faker.string.uuid(),
    fileName: faker.system.fileName(),
    children,
  }
}
