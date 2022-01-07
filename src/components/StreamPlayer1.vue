<template>
    <Artplayer v-if='show' :id='id' @get-instance='getInstance' :option='videoPlayerOptions' :style='videoPlayerStyle' />
</template>

<script lang='ts'>
import {
  onMounted,
  ref, watch
} from 'vue';
//@ts-ignore
import Artplayer from 'artplayer/examples/vue/Artplayer';
import { nanoid } from 'nanoid'

export default {
  name: 'StreamPlayer1',
  props: {
    src: {
      type: String,
      required: true,
      default:'',
    }
  },
  components: {
    Artplayer
  },
  setup(props: any) {
    const show = ref<boolean>(false);
    const id = ref<string>(nanoid(11));
    let instance = null;

    const videoPlayerOptions = ref({
      url: '',
      isLive: true,
      autoplay: true,
      autoSize: true,
      customType: {
        // @ts-ignore
        m3u8: function(video, url) {
          // @ts-ignore
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      }
    });
    const videoPlayerStyle = ref({
      width: '600px',
      height: '400px',
      margin: '60px auto 0'
    });

    const getInstance = (art: any) => {
      console.log('get instance: ');
      console.log(art);
      instance = art;
    };

    watch(() => props.src, (new_value, old_value) => {
      console.log(
        'Watch props.src function called with args:',
        new_value,
        old_value
      );
      show.value = false;
      setTimeout(() => {
        videoPlayerOptions.value.url = new_value;
        show.value = true;
        //todo: hove to find a elegant solution for this
        const element: any = document.getElementById(id.value);
        element.parentNode.removeChild(element);
      }, 1000);
    });

    onMounted(() => {
      if (props.src !== ''){
        videoPlayerOptions.value.url = props.src;
        show.value = true;
      }
    });

    return {
      getInstance,
      show,
      id,
      videoPlayerOptions,
      videoPlayerStyle
    };
  }
};
</script>

<style scoped>

</style>
