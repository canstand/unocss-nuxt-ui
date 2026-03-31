<script setup lang="ts">
const marquee = ref(false)
</script>

<template>
  <Navbar>
    <USwitch v-model="marquee" label="Marquee" />
  </Navbar>

  <UPageLogos title="Trusted by the best front-end teams" :marquee="marquee" class="w-lg">
    <UIcon name="simple-icons:github" class="shrink-0 size-10" />
    <UIcon name="simple-icons:discord" class="shrink-0 size-10" />
    <UIcon name="simple-icons:x" class="shrink-0 size-10" />
    <UIcon name="simple-icons:instagram" class="shrink-0 size-10" />
    <UIcon name="simple-icons:linkedin" class="shrink-0 size-10" />
    <UIcon name="simple-icons:facebook" class="shrink-0 size-10" />
  </UPageLogos>
</template>
