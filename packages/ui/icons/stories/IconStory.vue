<script setup lang="ts">
import { Heading } from ".."

const iconProps = {
  width: "4rem",
  height: "4rem",
}
</script>

<template>
  <section>
    <h2>Heading</h2>
    <div>
      <Heading.H1 v-bind="iconProps">Heading 1</Heading.H1>
      <Heading.H2 v-bind="iconProps">Heading 2</Heading.H2>
      <Heading.H3 v-bind="iconProps">Heading 3</Heading.H3>
      <Heading.H4 v-bind="iconProps">Heading 4</Heading.H4>
      <Heading.H5 v-bind="iconProps">Heading 5</Heading.H5>
      <Heading.H6 v-bind="iconProps">Heading 6</Heading.H6>
    </div>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  div {
    color: #333;
    display: flex;
    gap: 1rem;
  }
}
</style>
