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
    // needReloadInterval:{
    //   type: Number,
    //   default: 300
    // }
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
    this.player.player_.handleTechClick_ = function() {};


    // this.setupTimer();
    // this.setupEvents(this);
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  },
  methods:{
    setupTimer(){
      // if (isNullOrUndefined(this.needReloadInterval) || this.needReloadInterval < 1){
      //   return;
      // }
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
    },
    setupEvents(self){
      const prevEvents = {};
      prevEvents['error'] = { opName: 'error', createdAt: new Date() };
      prevEvents['waiting'] = { opName: 'waiting', createdAt: new Date() };
      prevEvents['suspend'] = { opName: 'suspend', createdAt: new Date() };
      prevEvents['emptied'] = { opName: 'emptied', createdAt: new Date() };
      prevEvents['stalled'] = { opName: 'stalled', createdAt: new Date() };
      prevEvents['durationchange'] = { opName: 'durationchange', createdAt: new Date() };

      const seekable = (opName) => {
        const prevEvent = prevEvents[opName];
        const diff = new Date().getTime() - prevEvent.createdAt.getTime();
        prevEvent.createdAt = new Date();
        if (diff < 500) {
          console.log('needReload no call due to 500 ms limit for ' + self.sourceId + ' ' + prevEvent.opName + '. diff: ' + diff);
          return false;
        }
        return true;
      };

      // Open it if a camera which has a bad connection needs this fix. BUt remember handler 404 HLS error. Otherwise, it stacked refreshing.
      self.player.on('error', () => {
        console.log(self.sourceId + ' omg error oldu!!!');
          self.player.liveTracker.seekToLiveEdge();
        // self.$emit('needReload', self.sourceId, 'error')
      });
      self.player.on('waiting', () => {
        console.log(self.sourceId + ' omg waiting oldu!!!');
        if (seekable('waiting')) {
           self.player.liveTracker.seekToLiveEdge();
        }
        // self.$emit('needReload', self.sourceId, 'waiting')
      });
      self.player.on('suspend', () => {
        console.log(self.sourceId + ' omg suspend oldu!!!');
        if (seekable('suspend')) {
           self.player.liveTracker.seekToLiveEdge();
        }
      });
      self.player.on('emptied', () => {
        console.log(self.sourceId + ' omg emptied oldu!!!');
        if (seekable('emptied')) {
           self.player.liveTracker.seekToLiveEdge();
        }
      });
      self.player.on('stalled', () => {
        console.log(self.sourceId + ' omg stalled oldu!!!');
        if (seekable('stalled')) {
           self.player.liveTracker.seekToLiveEdge();
        }
      });
      // self.player.on('seeking', ()=> {
      //   console.log(self.sourceId +  ' omg seeking oldu!!!');
      //    self.player.liveTracker.seekToLiveEdge();
      // });
      // self.player.on('seeked', ()=> {
      //   console.log(self.sourceId +  ' omg seeked oldu!!!');
      //    self.player.liveTracker.seekToLiveEdge();
      // });
      self.player.on('durationchange', () => {
        console.log(self.sourceId + ' omg durationchange oldu!!!');
        if (seekable('error')) {
           self.player.liveTracker.seekToLiveEdge();
        }
      });
    },
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
