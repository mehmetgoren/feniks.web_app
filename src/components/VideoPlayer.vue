<template>
  <div>
    <video ref="videoPlayer" class="video-js"></video>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {isNullOrEmpty} from 'src/utils/utils';
import {LocalService} from 'src/utils/services/local_service';

export default {
  name: 'VideoPlayer',
  emits: ['on-player-ready'],
  props: {
    src: {
      type: String,
      default: ''
    },
    autoPlay: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      player: null
    }
  },
  mounted() {
    function initPlayer(self, src) {
      const autoPlay = self.autoPlay;
      const videoOptions = {
        fluid: true,
        autoplay: autoPlay,
        controls: true,
        sources: [
          {
            src: src,
            type: 'video/mp4'
          }
        ],
        playbackRates: [0.25, 0.5, 1, 1.5, 2, 5]
      }
      self.player = videojs(self.$refs.videoPlayer, videoOptions);
      self.$emit('on-player-ready', self.player);
    }

    if (isNullOrEmpty(this.src)) {
      const me = this;
      new LocalService().getNodeAddress('blank.mp4').then(addr => {
        initPlayer(me, addr);
      }).catch(console.error);
    } else {
      initPlayer(this, this.src);
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>
