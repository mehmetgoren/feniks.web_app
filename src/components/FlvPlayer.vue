<template>
  <div>
    <video ref='videoPlayer' id='playerOne' class='video-js' controls preload='auto'>
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
      default: '',
      required: true
    },
    sourceId: {
      type: String,
      default: '',
      required: true
    },
    enableLog: {
      type: Boolean,
      default: false,
      required: true
    },
    seekToLiveEdgeInternal: {
      type: Number,
      default: 30,
      required: true
    },
    enableBooster: {
      type: Boolean,
      default: false,
      required: true
    },
    galleryIndex:{
      type:Number,
      default:0
    }
  },
  data() {
    return {
      player: null,
      prevEvents:{},
      setIntervalInstance: null
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
      controlBar: {
        remainingTimeDisplay: false,
        playToggle: false,
        progressControl: {},
        fullscreenToggle: {},
        volumeMenuButton: {
          inline: false,
          vertical: true
        }
      },
      controls: 'control',
      preload: 'auto',
      autoplay: true,
      muted: true,
      fluid: true,
      liveui: true
    };

    this.player = videojs(this.$refs.videoPlayer, options);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.player.player_.handleTechClick_ = function() {
    };


    this.setupEvents(this);

    if (this.seekToLiveEdgeInternal > 0) {
      const self = this;
      let index = this.galleryIndex;
      if (index === undefined || index === null){
        index = 0;
      }
      if (this.enableLog){
        console.log(`FlvPlayer(${this.sourceId}): index is ${index} and enable booster is: ${this.enableBooster}`);
      }
      setTimeout(()=>{
        const interval = self.seekToLiveEdgeInternal * 1000;
        self.setIntervalInstance = setInterval(() => {
          if (self.enableBooster){
            if(self.seekable('waiting')){
              self.seekToLiveEdge(self.player.liveTracker, 'interval');
            }
          }
        }, interval);
      }, index*2000);
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.player.liveTracker.dispose();
      this.player.dispose();
      if (this.enableLog){
        console.log(`FlvPlayer(${this.sourceId}): the player has been disposed at ${new Date().toLocaleString()}`);
      }
    }
    if (this.setIntervalInstance){
      clearInterval(this.setIntervalInstance);
      if (this.enableLog){
        console.log(`FlvPlayer(${this.sourceId}): the interval has been cleared at ${new Date().toLocaleString()}`);
      }
    }
  },
  methods: {
    seekToLiveEdge(liveTracker, by) {
      if (liveTracker.player_ == null) {
        if (this.enableLog) {
          console.log(`FlvPlayer(${this.sourceId}) seekToLiveEdge wont work since the liveTracker.player_ is null`);
        }
        return;
      }
      liveTracker.seekedBehindLive_ = false;
      if (liveTracker.atLiveEdge()) {
        if (this.enableLog) {
          console.log(`FlvPlayer(${this.sourceId}): atLiveEdge at ${new Date().toLocaleString()} by ${by}`);
        }
        return;
      }
      liveTracker.nextSeekedFromUser_ = false;
      liveTracker.player_.currentTime(liveTracker.liveCurrentTime() - .2);
      if (this.enableLog) {
        console.log(`FlvPlayer(${this.sourceId}): seekToLiveEdge at ${new Date().toLocaleString()} by ${by}`);
      }
    },
    fullScreen() {
      this.player.requestFullscreen();
    },
    pause() {
      this.player.pause();
    },
    seekable(opName){
      let prevEvent = this.prevEvents[opName];
      if (!prevEvent) {
        prevEvent = { opName: opName, createdAt: new Date() };
        this.prevEvents[opName] = prevEvent;
      }
      const diff = new Date().getTime() - prevEvent.createdAt.getTime();
      prevEvent.createdAt = new Date();
      if (diff < 500) {
        if (this.enableLog) {
          console.log(`FlvPlayer(${this.sourceId}): no call due to 500 ms limit for ${prevEvent.opName}, diff ${diff}`);
        }
        return false;
      }
      return true;
    },
    setupEvents(self) {
      // Open it if a camera which has a bad connection needs this fix. BUt remember handler 404 HLS error. Otherwise, it stacked refreshing.
      self.player.on('error', () => {
        if (self.seekable('error')) {
          self.seekToLiveEdge(self.player.liveTracker, 'error');
        }
      });
      self.player.on('waiting', () => {
        if (self.seekable('waiting')) {
          self.seekToLiveEdge(self.player.liveTracker, 'waiting');
        }
      });
    }
  }
};
</script>

<style scoped>
.vjs-tech {
  pointer-events: none;
}

.video-js.vjs-playing .vjs-tech {
  pointer-events: none;
}
</style>
