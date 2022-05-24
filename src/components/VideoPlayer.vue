<template>
  <div>
    <video ref="videoPlayer" class="video-js"></video>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      default: 'http://vjs.zencdn.net/v/oceans.mp4',
    },
    autoPlay:{
      type:Boolean,
      required:true
    }
  },
  data() {
    return {
      player: null
    }
  },
  mounted() {
    const autoPlay = this.autoPlay;
    const videoOptions = {
        fluid: true,
        autoplay: autoPlay,
        controls: true,
        sources: [
        {
          src:this.src,
          type: 'video/mp4'
        }
      ]
    }
    this.player = videojs(this.$refs.videoPlayer, videoOptions);
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>
