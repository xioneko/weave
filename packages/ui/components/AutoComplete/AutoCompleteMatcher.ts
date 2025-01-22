export type AutoCompleteMatcher<Item> = (value: Item, query: string) => number | boolean

export const prefixMatcher: AutoCompleteMatcher<string> = (value: string, query: string) => {
  if (query === "") return true
  if (value.length < query.length) return false
  const input = query.toLowerCase()
  const itemValue = value.toLowerCase()
  return itemValue.startsWith(input) ? 1 / itemValue.length : false
}

export const subsequenceMatcher: AutoCompleteMatcher<string> = (value: string, query: string) => {
  if (query === "") return true
  if (value.length < query.length) return false
  const input = query.toLowerCase()
  const itemValue = value.toLowerCase()
  let i = 0,
    j = 0
  while (j < itemValue.length) {
    if (input[i] === itemValue[j]) {
      i += 1
      if (i === input.length) return true
    }
    j += 1
  }
  return false
}

export const weightedSubsequenceMatcher: AutoCompleteMatcher<string> = (
  value: string,
  query: string,
) => {
  if (query === "") return true
  if (value.length < query.length) return false
  const input = query.toLowerCase()
  const itemValue = value.toLowerCase()
  let i = 0,
    j = 0,
    s = 0
  let left!: number, right!: number
  while (j < itemValue.length) {
    if (input[i] === itemValue[j]) {
      i += 1
      s += (j + 1) ** 2 // prefer prefix matches
      if (i === 1) left = j
      if (i === input.length) {
        right = j
        break
      }
    }
    j += 1
  }
  if (i < input.length) return false // input must be a subsequence of value
  const gapPenalty = input.length / (right - left + 1)
  return ((itemValue.length * input.length) / s) * gapPenalty
}

export const prefixSubsequenceMatcher: AutoCompleteMatcher<string> = (
  value: string,
  query: string,
) => {
  if (query === "") return true
  if (value.length < query.length) return false
  const input = query.toLowerCase()
  const itemValue = value.toLowerCase()
  if (input[0] !== itemValue[0]) return false
  if (input.length === 1) return 1
  let i = 1,
    j = 1
  while (j < itemValue.length) {
    if (input[i] === itemValue[j]) {
      i += 1
      if (i === input.length) return 1 / itemValue.length
    }
    j += 1
  }
  return false
}
