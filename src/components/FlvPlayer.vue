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


    this.setupEvents(this);
  },
  beforeUnmount() {
    if (this.player) {
      this.player.liveTracker.dispose();
      this.player.dispose();
    }
  },
  methods:{
    fullScreen(){
      this.player.requestFullscreen();
    },
    pause(){
      this.player.pause();
    },
    setupEvents(self){
      const prevEvents = {};

      const seekable = (opName) => {
        let prevEvent = prevEvents[opName];
        if (!prevEvent){
          prevEvent = { opName: opName, createdAt: new Date() };
          prevEvents[opName] = prevEvent;
        }
        const diff = new Date().getTime() - prevEvent.createdAt.getTime();
        prevEvent.createdAt = new Date();
        if (diff < 500) {
          console.log('no call due to 500 ms limit for ' + self.sourceId + ' ' + prevEvent.opName + '. diff: ' + diff);
          return false;
        }
        return true;
      };

      const seekToLiveEdge = (liveTracker) => {
        liveTracker.seekedBehindLive_ = false;
        if (liveTracker.atLiveEdge()) {
          console.log('atLiveEdge at ' + + new Date().toLocaleString())
          return;
        }
        liveTracker.nextSeekedFromUser_ = false;
        liveTracker.player_.currentTime(liveTracker.liveCurrentTime() - .1);

      }

      // Open it if a camera which has a bad connection needs this fix. BUt remember handler 404 HLS error. Otherwise, it stacked refreshing.
      self.player.on('error', () => {
        console.log(self.sourceId + ' omg error oldu!!!');
      });
      self.player.on('waiting', () => {
        console.log(self.sourceId + ' omg waiting oldu!!!');
        if (seekable('waiting')) {
           // self.player.liveTracker.trackLive_();
          seekToLiveEdge(self.player.liveTracker);
           console.log('seekToLiveEdge at' + new Date().toLocaleString())
        }
      });
      // self.player.on('progress', ()=> {
      //   console.log(self.sourceId +  ' omg progress oldu!!!');
      //   if (seekable('progress')) {
      //     // self.player.liveTracker.startTracking()
      //   }
      // });
      // self.player.on('durationchange', () => {
      //   console.log(self.sourceId + ' omg durationchange oldu!!!');
      //   if (seekable('durationchange')) {
      //   }
      // });
      // self.player.on('suspend', () => {
      //   console.log(self.sourceId + ' omg suspend oldu!!!');
      //   if (seekable('suspend')) {
      //   }
      // });
      // self.player.on('emptied', () => {
      //   console.log(self.sourceId + ' omg emptied oldu!!!');
      //   if (seekable('emptied')) {
      //   }
      // });
      // self.player.on('stalled', () => {
      //   console.log(self.sourceId + ' omg stalled oldu!!!');
      //   if (seekable('stalled')) {
      //   }
      // });
      // self.player.on('seeking', ()=> {
      //   console.log(self.sourceId +  ' omg seeking oldu!!!');
      //   if (seekable('seeking')) {
      //   }
      // });
      // self.player.on('seeked', ()=> {
      //   console.log(self.sourceId +  ' omg seeked oldu!!!');
      //   if (seekable('seeked')) {
      //   }
      // });
      // self.player.on('loadedmetadata', ()=> {
      //   console.log(self.sourceId +  ' omg loadedmetadata oldu!!!');
      //   if (seekable('loadedmetadata')) {
      //   }
      // });
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
