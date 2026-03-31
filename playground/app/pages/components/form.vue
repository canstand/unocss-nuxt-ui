<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const schema = z.object({
  email: z.email(),
  password: z.string('Password is required').min(8),
  tos: z.literal(true),
})

type Schema = z.input<typeof schema>

const state = reactive<Partial<Schema>>({})

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}

const validateOn = ref(['input', 'change', 'blur'])
const disabled = ref(false)
</script>

<template>
  <Navbar />

  <div class="mt-16 pb-8 flex flex-col gap-8 min-h-0">
    <div class="flex gap-4">
      <UForm
        :state="state"
        :schema="schema"
        class="flex flex-col gap-4 w-60"
        @submit="onSubmit"
      >
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" placeholder="john@lennon.com" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormField>

        <UFormField name="tos">
          <UCheckbox v-model="state.tos" label="I accept the terms and conditions" />
        </UFormField>

        <div>
          <UButton type="submit">
            Submit
          </UButton>
        </div>
      </UForm>
      <FormExampleNested />
      <FormExampleNestedList />
    </div>

    <div class="border-default border rounded-lg">
      <div class="px-4 py-2 flex gap-4 items-center">
        <UFormField label="Validate on" class="flex gap-2 items-center">
          <USelectMenu v-model="validateOn" :items="['input', 'change', 'blur']" multiple class="w-48" />
        </UFormField>
        <UCheckbox v-model="disabled" label="Disabled" />
      </div>

      <FormExampleElements :validate-on="validateOn" :disabled="disabled" class="border-default p-4 border-t" />
    </div>
  </div>
</template>
