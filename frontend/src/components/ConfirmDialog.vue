<template>
  <Transition name="dialog">
    <div
      v-if="dialogStore.isOpen"
      class="fixed inset-0 bg-black/10 flex items-center justify-center z-[1000]"
      @click="dialogStore.cancel"
    >
      <div
        class="bg-white border-2 border-black rounded-2xl shadow-[0_8px_0_#000] w-full max-w-xl min-w-[350px] max-h-[80vh] px-8 py-7 flex flex-col gap-6 font-outfit animate-[pop-in_0.25s_cubic-bezier(.68,-0.55,.27,1.55)]"
        @click.stop
      >
        <template v-if="dialogStore.customComponent">
          <component
            :is="dialogStore.customComponent"
            v-bind="dialogStore.customComponentProps"
            @close="dialogStore.cancel"
          />
        </template>
        <template v-else>
          <div class="border-b border-gray-200 pb-3 flex-shrink-0">
            <h2 class="text-2xl font-extrabold text-zinc-900 m-0">
              {{ dialogStore.options.title }}
            </h2>
          </div>
          <div class="overflow-y-auto flex-1 min-h-0">
            <div
              v-if="dialogStore.options.rawHtml"
              class="text-base text-zinc-800 leading-relaxed prose prose-sm max-w-none"
              v-html="dialogStore.options.message"
            ></div>
            <p v-else class="text-base text-zinc-800 leading-relaxed whitespace-pre-line">
              {{ dialogStore.options.message }}
            </p>
          </div>
          <div class="flex justify-end gap-4 pt-2 border-t border-gray-200 flex-shrink-0">
            <ButtonComponent variant="outline" @click="dialogStore.cancel" class="min-w-[120px]">
              {{ dialogStore.options.cancelText }}
            </ButtonComponent>
            <ButtonComponent
              :variant="dialogStore.options.type === 'error' ? 'primary' : 'outline'"
              @click="dialogStore.confirm"
              class="min-w-[180px]"
            >
              {{ dialogStore.options.confirmText }}
            </ButtonComponent>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useDialogStore } from "@/stores/dialog";
import ButtonComponent from "@/components/buttons/ButtonComponent.vue";

const dialogStore = useDialogStore();
</script>

<style scoped>
@keyframes pop-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
