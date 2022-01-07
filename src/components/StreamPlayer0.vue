<template>
  <div>
    <Vue3VideoPlayer v-if='show' :title='"test title"' :core='HLSCore' :src='src' :muted='true' :autoplay='true'
                     :preload='"metadata"' />
  </div>
</template>

<script lang='ts'>
// @ts-ignore
import HLSCore from '@cloudgeek/playcore-hls';
import '@cloudgeek/vue3-video-player/dist/vue3-video-player.css';
import { ref, watch } from 'vue';

export default {
  name: 'StreamPlayer0',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  setup(props: any) {
    const show = ref<boolean>(false);
    watch(() => props.src, (new_value, old_value) => {
      console.log(
        'Watch props.src function called with args:',
        new_value,
        old_value
      );
      show.value = false;
      setTimeout(() => {
        show.value = true;
      }, 1000);
    });
    return {
      HLSCore,
      show
    };
  }
};
</script>

<style scoped>

</style>
