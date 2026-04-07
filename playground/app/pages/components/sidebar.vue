<script setup lang="ts">
import theme from '#build/ui/sidebar'

const variants = Object.keys(theme.variants.variant)

const openLeft = ref(false)

const variant = ref('sidebar' as keyof typeof theme.variants.variant)
</script>

<template>
  <div class="flex flex-1" :class="[variant === 'inset' && 'bg-neutral-50 dark:bg-neutral-950']">
    <USidebar
      v-model:open="openLeft"
      side="left"
      :variant="variant"
      collapsible="icon"
      close
      rail
      :ui="{ container: 'relative', body: 'py-2' }"
    >
      <template #title="{ state }">
        <Logo class="h-5 w-auto" :collapsed="state === 'collapsed'" />
      </template>

      <UNavigationMenu
        :items="[{ label: 'Home', icon: 'i-lucide-home', to: '/', badge: 4 }]"
        orientation="vertical"
        :ui="{ link: 'p-1.5 overflow-hidden' }"
      />
    </USidebar>

    <div class="bg-default flex flex-1 flex-col overflow-hidden peer-data-[variant=inset]:ring-default peer-data-[variant=inset]:m-4 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:ring peer-data-[variant=inset]:shadow-sm lg:peer-data-[variant=floating]:my-4 lg:peer-data-[variant=inset]:mx-0">
      <Navbar class="w-full relative">
        <USelect v-model="variant" :items="variants" />

        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="soft"
          size="sm"
          aria-label="Toggle left sidebar"
          @click="openLeft = !openLeft"
        />
      </Navbar>

      <div class="p-4 flex-1 sm:px-6">
        <USkeleton class="size-full animate-pulse" />
      </div>
    </div>
  </div>
</template>
