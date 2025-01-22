export {
  default as AutoCompleteRoot,
  default as Root,
  AutoCompleteContext as AutoCompleteRootContext,
  type AutoCompleteRootProps,
  type AutoCompleteContextValue,
  injectCollection,
} from "./AutoCompleteRoot.vue"
export {
  type AutoCompleteMatcher,
  type AutoCompleteMatcher as Matcher,
  prefixMatcher,
  weightedSubsequenceMatcher,
  subsequenceMatcher,
  prefixSubsequenceMatcher,
} from "./AutoCompleteMatcher"
export { default as AutoCompleteInput, default as Input } from "./AutoCompleteInput.vue"
export {
  default as AutoCompleteItem,
  default as Item,
  type AutoCompleteItemProps,
} from "./AutoCompleteItem.vue"
export { default as AutoCompleteContent, default as Content } from "./AutoCompleteContent.vue"
export {
  default as AutoCompleteGroup,
  default as Group,
  type AutoCompleteGroupProps,
} from "./AutoCompleteGroup.vue"
