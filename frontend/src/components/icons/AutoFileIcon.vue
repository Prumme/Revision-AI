<script setup lang="ts">
import { LucideArchive, LucideFile, LucideFileAudio, LucideFileImage, LucideFileText, LucideFileVideo } from 'lucide-vue-next';
import { defineProps } from 'vue';

const props = defineProps<{
  mimeType: string;
}>();
</script>
<template>
    <template v-if="props.mimeType.startsWith('image/')">
        <LucideFileImage v-bind="$attrs" />
    </template>
    <template v-else-if="props.mimeType.startsWith('video/')">
        <LucideFileVideo v-bind="$attrs" />
    </template>
    <template v-else-if="props.mimeType.startsWith('audio/')">
        <LucideFileAudio v-bind="$attrs" />
    </template>
    <template v-else-if="props.mimeType === 'application/pdf'">
        <LucideFileText v-bind="$attrs" />
    </template>
    <template v-else-if="props.mimeType === 'application/zip' || props.mimeType === 'application/x-zip-compressed'">
        <LucideArchive v-bind="$attrs" />
    </template>
    <template v-else>
        <LucideFile v-bind="$attrs" />
    </template>
</template>