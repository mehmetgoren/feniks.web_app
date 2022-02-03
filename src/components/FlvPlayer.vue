<template>
  <div>
    <video ref='videoPlayer' id='playerOne' class='video-js' controls preload="auto" >
      <source :src='src' type='video/x-flv'>
    </video>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import 'videojs-flvjs-es6';
import { isNullOrUndefined } from 'src/utils/utils';

export default {
  name: 'FlvPlayer',
  props: {
    src: {
      type: String,
      default: '',
      required: true
    },
    sourceId: {
      type: String,
      default: '',
      required:true
    },
    needReloadInterval:{
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      player: null
    };
  },
  mounted() {
    const options = {
      flvjs: {
        mediaDataSource: {
          isLive: true,
          cors: true,
          withCredentials: false,
        }
      },
      controls: 'control',
      preload: 'auto',
      autoplay: true,
      muted: true,
      fluid: true
    };

    this.player = videojs(this.$refs.videoPlayer, options);

    this.setupTimer();
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods:{
    setupTimer(){
      if (isNullOrUndefined(this.needReloadInterval) || this.needReloadInterval < 1){
        return;
      }
      const self = this;
      const interval = this.needReloadInterval * 1000;
      setInterval(() => {
        self.$emit('needReload', self.sourceId, 'needReload')
      }, interval);
    },
    fullScreen(){
      this.player.requestFullscreen();
    },
    pause(){
      this.player.pause();
    }
  }
};
</script>
