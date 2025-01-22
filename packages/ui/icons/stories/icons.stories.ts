import IconStory from "./IconStory.vue"
import type { Meta, StoryObj } from "@storybook/vue3"

export default {
  title: "Design/Icons",
} satisfies Meta

export const AllIcons: StoryObj = {
  render: () => ({
    components: { IconStory },
    template: `<IconStory />`,
  }),
}
