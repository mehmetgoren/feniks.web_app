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
    seekToLiveEdgeInternal: {
      type: Number,
      default: 30,
      required: true
    },
    enableLog: {
      type: Boolean,
      default: false,
      required: true
    },
    enableBooster: {
      type: Boolean,
      default: false,
      required: true
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
    this.player.player_.handleTechClick_ = function() {
    };


    this.setupEvents(this);

    if (this.seekToLiveEdgeInternal > 0) {
      const interval = this.seekToLiveEdgeInternal * 1000;
      const self = this;
      setInterval(() => {
        if (this.enableBooster){
          self.seekToLiveEdge(self.player.liveTracker);
        }
      }, interval);
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.player.liveTracker.dispose();
      this.player.dispose();
    }
  },
  methods: {
    seekToLiveEdge(liveTracker) {
      if (liveTracker.player_ == null) {
        if (this.enableLog) {
          console.log(`FlvPlayer(${this.sourceId}) seekToLiveEdge wont work since the liveTracker.player_ is null`);
        }
        return;
      }
      liveTracker.seekedBehindLive_ = false;
      if (liveTracker.atLiveEdge()) {
        if (this.enableLog) {
          console.log(`FlvPlayer(${this.sourceId}): atLiveEdge at ${new Date().toLocaleString()}`);
        }
        return;
      }
      liveTracker.nextSeekedFromUser_ = false;
      liveTracker.player_.currentTime(liveTracker.liveCurrentTime() - .2);
      if (this.enableLog) {
        console.log(`FlvPlayer(${this.sourceId}): seekToLiveEdge at ${new Date().toLocaleString()}`);
      }
    },
    fullScreen() {
      this.player.requestFullscreen();
    },
    pause() {
      this.player.pause();
    },
    setupEvents(self) {
      const prevEvents = {};

      const seekable = (opName) => {
        let prevEvent = prevEvents[opName];
        if (!prevEvent) {
          prevEvent = { opName: opName, createdAt: new Date() };
          prevEvents[opName] = prevEvent;
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
      };

      // Open it if a camera which has a bad connection needs this fix. BUt remember handler 404 HLS error. Otherwise, it stacked refreshing.
      self.player.on('error', () => {
        if (seekable('error')) {
          self.seekToLiveEdge(self.player.liveTracker);
        }
      });
      self.player.on('waiting', () => {
        if (seekable('waiting')) {
          self.seekToLiveEdge(self.player.liveTracker);
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
