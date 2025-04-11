<script setup lang="ts">
import DynamicIcon from "@/components/icons/DynamicIcon.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

<<<<<<< Updated upstream
const { to, icon, text, active } = defineProps<{
  to: string;
  icon: string;
  text: string;
  active: boolean;
}>();
=======
const { to, icon, text } = defineProps<{
  to: string;
  icon: string;
  text: string;
  showText: boolean;
}>();

const route = useRoute();
const active = computed(() => route.path === to);
>>>>>>> Stashed changes
</script>

<template>
  <RouterLink
    :to="to"
<<<<<<< Updated upstream
    class="flex items-center gap-5 px-4 py-3 rounded-lg"
    :class="{ 'hover:bg-primary  duration-200': !active, 'bg-primary ': active }"
=======
    class="flex items-center gap-5 px-4 py-3 rounded-lg text-sm"
    :class="{ 'hover:bg-primary/50 duration-200': !active, 'bg-primary/80': active }"
>>>>>>> Stashed changes
  >
    <DynamicIcon :name="icon" />
    <span v-if="showText">{{ text }}</span>
  </RouterLink>
</template>
