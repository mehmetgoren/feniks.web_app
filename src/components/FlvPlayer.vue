<template>
  <div>
    <video ref='videoPlayer' id='playerOne' class='video-js' controls>
      <source :src='src' type='video/x-flv'>
    </video>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import 'videojs-flvjs-es6';

export default {
  name: 'FlvPlayer',
  props: {
    src: {
      type: String,
      default: ''
    },
    sourceId: {
      type: String,
      default: ''
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
          withCredentials: false
        }
      },
      controls: 'control',
      preload: 'auto',
      auto_play: true,
      muted: true,
      fluid: true
    };

    this.player = videojs(this.$refs.videoPlayer, options, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
    this.player.play();
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods:{
    fullScreen(){
      this.player.requestFullscreen();
    },
    pause(){
      this.player.pause();
    }
  }
};
</script>
