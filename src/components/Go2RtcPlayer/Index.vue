<template>
  <div :id="containerId" style="height: 100%">
  </div>
</template>

<script setup lang="ts">
import './video-stream';
import {onMounted} from 'vue';
import {v4 as uuidv4} from 'uuid';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  sourceId: {
    type: String,
    required: true
  },
  mode: {
    type: Number,
    required: true,
  },
  galleryIndex: {
    type: Number,
    default: 0,
    required: true
  },
});

const emit = defineEmits(['user-activity'])

const containerId = uuidv4();
let block = false;

onMounted(() => {
  const video: any = document.createElement('video-stream');
  const containerElement: HTMLElement = <HTMLElement>document.getElementById(containerId);
  containerElement.appendChild(video);
  video.src = props.src;
  video.mode = props.mode === 0 ? 'mse' : 'webrtc'; // 'webrtc' or 'mse'
  if (containerElement) {
    const videoElement = containerElement.querySelector('video');
    if (videoElement) {
      videoElement.addEventListener('click', (e) => e.preventDefault());
      videoElement.addEventListener('mouseover', () => emit('user-activity', {sourceId: props.sourceId, userActive: true}));
      videoElement.addEventListener('mouseleave', () => {
        if (block) return;
        block = true;
        setTimeout(() => {
          emit('user-activity', {sourceId: props.sourceId, userActive: false});
          block = false;
        }, 3000);
      });
    }
  }
});

</script>

<style scoped>

::v-deep(video::-webkit-media-controls-current-time-display) {
  display: none;
}

::v-deep(video::-webkit-media-controls-play-button) {
  display: none;
}

::v-deep(audio::-webkit-media-controls-timeline) {
  display: none;
}

::v-deep(video::-webkit-media-controls-timeline) {
  display: none;
}

</style>
