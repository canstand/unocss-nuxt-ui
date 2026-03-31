<template>
  <Navbar />

  <div class="flex gap-2 items-center">
    <div class="text-sm flex flex-col gap-2 items-start">
      <ULink raw>
        Button raw
      </ULink>

      <ULink active>
        Button active
      </ULink>
      <ULink active class="font-medium" active-class="text-highlighted">
        Button active with class
      </ULink>
      <ULink active disabled>
        Button active disabled
      </ULink>

      <ULink>
        Button inactive
      </ULink>
      <ULink class="font-medium" inactive-class="hover:text-primary">
        Button inactive with class
      </ULink>
      <ULink disabled>
        Button inactive disabled
      </ULink>
    </div>

    <div class="text-sm flex flex-col gap-2 items-start">
      <ULink to="/components/link" raw>
        Link raw
      </ULink>

      <ULink to="/components/link">
        Link active
      </ULink>
      <ULink to="/components/link" class="font-medium" active-class="text-highlighted">
        Link active with class
      </ULink>
      <ULink to="/components/link" disabled>
        Link active disabled
      </ULink>

      <ULink to="/components/button">
        Link inactive
      </ULink>
      <ULink to="/components/button" class="font-medium" inactive-class="hover:text-primary">
        Link inactive with class
      </ULink>
      <ULink to="/components/button" disabled>
        Link inactive disabled
      </ULink>
    </div>
  </div>
</template>
