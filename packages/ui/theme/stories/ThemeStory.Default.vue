<script setup lang="ts">
import { vars } from "../contract.css"
import "../default.css"
</script>

<template>
  <section>
    <h2>Font-Size</h2>
    <hr />
    <div>
      <p
        v-for="[scale, css] of Object.entries(vars.text)"
        :style="{
          fontSize: css,
        }"
      >
        text-{{ scale }}
      </p>
    </div>
  </section>
</template>
