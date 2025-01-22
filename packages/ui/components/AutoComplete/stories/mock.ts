import { faker } from '@faker-js/faker'

faker.seed(123)

export function getNames(n: number) {
  const names = []
  for (let i = 0; i < n; i++) {
    names.push(faker.person.fullName())
  }
  return names
}
