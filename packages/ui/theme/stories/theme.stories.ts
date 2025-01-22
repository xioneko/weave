import ThemeStoryDefault from "./ThemeStory.Default.vue"
import type { Meta, StoryObj } from "@storybook/vue3"

export default {
  title: "Design/Theme",
} satisfies Meta

export const Default: StoryObj = {
  render() {
    return {
      components: { ThemeStoryDefault },
      template: `<ThemeStoryDefault />`,
    }
  },
}
