<script setup lang="ts">
import theme from '#build/ui/marquee'

const orientations = Object.keys(theme.variants.orientation)

const orientation = ref('horizontal' as keyof typeof theme.variants.orientation)
const pauseOnHover = ref(false)
const reverse = ref(false)
const overlay = ref(false)
</script>

<template>
  <Navbar>
    <USelect v-model="orientation" :items="orientations" />
    <USwitch v-model="pauseOnHover" label="Pause" />
    <USwitch v-model="reverse" label="Reverse" />
    <USwitch v-model="overlay" label="Overlay" />
  </Navbar>

  <UMarquee
    :orientation="orientation"
    :pause-on-hover="pauseOnHover"
    :reverse="reverse"
    :overlay="overlay"
    class="data-[orientation=horizontal]:w-lg"
  >
    <UIcon name="simple-icons:github" class="shrink-0 size-10" />
    <UIcon name="simple-icons:discord" class="shrink-0 size-10" />
    <UIcon name="simple-icons:x" class="shrink-0 size-10" />
    <UIcon name="simple-icons:instagram" class="shrink-0 size-10" />
    <UIcon name="simple-icons:linkedin" class="shrink-0 size-10" />
    <UIcon name="simple-icons:facebook" class="shrink-0 size-10" />
  </UMarquee>
</template>
