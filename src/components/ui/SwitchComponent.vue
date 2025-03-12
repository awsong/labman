<template>
  <button
    type="button"
    :class="[
      modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
    ]"
    @click="$emit('update:model-value', !modelValue)"
  >
    <span class="sr-only">Toggle switch</span>
    <span
      :class="[
        modelValue ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
      ]"
    />
  </button>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["update:model-value"]);
</script>
