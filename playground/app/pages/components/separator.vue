<template>
  <Navbar />

  <div class="flex flex-col gap-4 min-h-0">
    <div>
      <p class="text-highlighted font-semibold">
        Nuxt UI
      </p>
      <p>An open-source UI component library.</p>
    </div>

    <USeparator icon="i-simple-icons-nuxtdotjs" type="dashed" />

    <div class="flex gap-4 h-24 items-center">
      <div class="text-center flex-1">
        Blog
      </div>

      <USeparator
        :avatar="{ src: 'https://github.com/benjamincanac.png' }"
        decorative
        orientation="vertical"
      />

      <div class="text-center flex-1">
        Docs
      </div>

      <USeparator decorative orientation="vertical">
        <UAvatar size="2xs" src="https://github.com/sandros94.png" />
      </USeparator>

      <div class="text-center flex-1">
        Source
      </div>
    </div>

    <USeparator label="As simple as it gets" type="dotted" size="lg" color="primary" />

    <USeparator label="Start" position="start" />

    <USeparator label="End" position="end" />

    <div class="flex gap-4 h-24 items-center">
      <div class="text-center flex-1">
        Start
      </div>

      <USeparator
        :avatar="{ src: 'https://github.com/benjamincanac.png' }"
        decorative
        orientation="vertical"
        position="start"
      />

      <USeparator decorative orientation="vertical" position="end">
        <UAvatar size="2xs" src="https://github.com/sandros94.png" />
      </USeparator>

      <div class="text-center flex-1">
        End
      </div>
    </div>
  </div>
</template>
