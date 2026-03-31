<template>
  <Navbar to="https://ui.nuxt.com/docs/getting-started/integrations/color-mode" />

  <div class="flex flex-col gap-4 items-center">
    <div class="flex gap-2 items-center">
      <UColorModeSwitch />
      <UColorModeSelect />
      <UColorModeButton />
    </div>

    <div class="flex gap-2 items-center">
      <UColorModeAvatar light="https://github.com/vuejs.png" dark="https://github.com/nuxt.png" />
      <UColorModeImage light="https://github.com/vuejs.png" dark="https://github.com/nuxt.png" class="size-8" />
    </div>
  </div>
</template>
