<script setup lang="ts">
const open = ref(false)
const openCustomAnchor = ref(false)
const loading = ref(false)

function send() {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    open.value = false
  }, 1000)
}
</script>

<template>
  <Navbar />

  <div class="text-center min-h-0">
    <div>
      <UPopover arrow :content="{ side: 'top' }">
        <UButton label="Click me top" color="neutral" variant="outline" />

        <template #content="{ close }">
          <div class="p-4 flex gap-2 w-48 justify-center">
            <UButton label="Close" color="neutral" @click="close" />
          </div>
        </template>
      </UPopover>

      <div class="my-2 flex gap-2 items-center">
        <UPopover arrow :content="{ side: 'left' }">
          <UButton label="Click me left" color="neutral" variant="outline" />

          <template #content>
            <div class="h-16 w-48" />
          </template>
        </UPopover>

        <UPopover arrow :content="{ side: 'right' }">
          <UButton label="Click me right" color="neutral" variant="outline" />

          <template #content>
            <div class="h-16 w-48" />
          </template>
        </UPopover>
      </div>

      <UPopover v-model:open="open" arrow>
        <UButton label="Click me bottom" color="neutral" variant="outline" />

        <template #content>
          <div class="p-4 flex gap-2 w-48 justify-center">
            <UButton label="Close" color="neutral" @click="open = false" />
            <UButton label="Send" color="neutral" trailing-icon="i-lucide-send-horizontal" :loading="loading" @click="send" />
          </div>
        </template>
      </UPopover>

      <div class="mt-8 relative">
        <UPopover
          v-model:open="openCustomAnchor"
          :dismissible="false"
        >
          <template #anchor>
            <UInput placeholder="Search" class="w-56" @focus="openCustomAnchor = true" />
          </template>

          <template #content>
            <Placeholder class="m-4 inline-flex size-48" />
          </template>
        </UPopover>
      </div>
    </div>

    <div class="mt-24">
      <UPopover mode="hover" arrow :content="{ side: 'top' }">
        <UButton label="Hover me top" color="neutral" variant="outline" />

        <template #content>
          <div class="h-16 w-48" />
        </template>
      </UPopover>

      <div class="my-2 flex gap-2 items-center">
        <UPopover mode="hover" arrow :content="{ side: 'left' }">
          <UButton label="Hover me left" color="neutral" variant="outline" />

          <template #content>
            <div class="h-16 w-48" />
          </template>
        </UPopover>

        <UPopover mode="hover" arrow :content="{ side: 'right' }">
          <UButton label="Hover me right" color="neutral" variant="outline" />

          <template #content>
            <div class="h-16 w-48" />
          </template>
        </UPopover>
      </div>

      <UPopover mode="hover" arrow>
        <UButton label="Hover me bottom" color="neutral" variant="outline" />

        <template #content>
          <div class="h-16 w-48" />
        </template>
      </UPopover>
    </div>
  </div>
</template>
