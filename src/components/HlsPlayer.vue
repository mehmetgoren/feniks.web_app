<template>
  <div class='video-player' v-if='reset' style='width: 100%;height: 100%;'>
    <video class='video-js' ref='video'>
      <track v-for='crtTrack in trackList' :kind='crtTrack.kind' :label='crtTrack.label' :src='crtTrack.src'
             :key='crtTrack.src'
             :srcLang='crtTrack.srcLang' :default='crtTrack.default'/>
    </video>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
//https://github.com/surmon-china/vue-video-player/blob/master/src/player.vue
//or https://docs.videojs.com/tutorial-vue.html
// as of videojs 6.6.0
const DEFAULT_EVENTS = [
  'loadeddata',
  'canplay',
  'canplaythrough',
  'play',
  'pause',
  'waiting',
  'playing',
  'ended',
  'error'
];

export default {
  name: 'HlsPlayer',
  props: {
    start: {
      type: Number,
      default: 0
    },
    crossOrigin: {
      type: String,
      default: ''
    },
    playsinline: {
      type: Boolean,
      default: false
    },
    customEventName: {
      type: String,
      default: 'statechanged'
    },
    events: {
      type: Array,
      default: () => []
    },
    globalOptions: {
      type: Object,
      default: () => ({
        // autoplay: false,
        controls: true,
        preload: 'auto',
        fluid: false,
        muted: false,
        controlBar: {
          remainingTimeDisplay: false,
          playToggle: false,
          progressControl: {},
          fullscreenToggle: {},
          pictureInPictureToggle: true,
          volumeMenuButton: {
            inline: false,
            vertical: true
          }
        },
        // controlBar: false,
        techOrder: ['html5'],
        plugins: {}
      })
    },
    globalEvents: {
      type: Array,
      default: () => []
    },
    trackList: {
      type: Array,
      default: () => []
    },
    src: {
      type: String,
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
    galleryIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      player: null,
      reset: true,
      prevEvents: {},
      setIntervalInstance: null,
      options: {
        autoplay: true,
        muted: true,
        responsive: true,
        // fluid: true,
        fill: true,
        language: 'en',
        sources: [{
          type: 'application/x-mpegURL',
          src: ''
        }]
      }
    };
  },
  mounted() {
    if (!this.player) {
      this.options.sources[0].src = this.src;
      this.initialize();

      if (this.seekToLiveEdgeInternal > 0) {
        let index = this.galleryIndex;
        if (index === undefined || index === null) {
          index = 0;
        }
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}): index is ${index} and enable booster is: ${this.enableBooster}`);
        }
        if (!this.enableBooster) {
          if (this.enableLog) {
            console.log(`HlsPlayer(${this.sourceId}): booster mode will not be invoke setTimeout, exiting now...`);
          }
          return;
        }

        const self = this;
        const interval = this.seekToLiveEdgeInternal * 1000;
        this.setIntervalInstance = this.setRandomInterval(() => {
          if (self.seekable('waiting')) {
            self.seekToLiveEdge(self.player, 'interval');
          }
        }, 0, interval);
      }
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.dispose();
      if (this.enableLog) {
        console.log(`HlsPlayer(${this.sourceId}): the player has been disposed at ${new Date().toLocaleString()}`);
      }
    }
    if (this.setIntervalInstance) {
      this.setIntervalInstance.clear();
      if (this.enableLog) {
        console.log(`HlsPlayer(${this.sourceId}): the interval has been cleared at ${new Date().toLocaleString()}`);
      }
    }
  },
  methods: {
    initialize() {
      const videoOptions = Object.assign({}, this.globalOptions, this.options);
      // ios fullscreen
      if (this.playsinline) {
        this.$refs.video.setAttribute('playsinline', this.playsinline);
        this.$refs.video.setAttribute('webkit-playsinline', this.playsinline);
        this.$refs.video.setAttribute('x5-playsinline', this.playsinline);
        this.$refs.video.setAttribute('x5-video-player-type', 'h5');
        this.$refs.video.setAttribute('x5-video-player-fullscreen', false);
      }
      // cross origin
      if (this.crossOrigin !== '') {
        this.$refs.video.crossOrigin = this.crossOrigin;
        this.$refs.video.setAttribute('crossOrigin', this.crossOrigin);
      }
      // emit event
      const emitPlayerState = (event, value) => {
        if (event) {
          this.$emit(event, this.player);
        }
        if (value) {
          this.$emit(this.customEventName, {[event]: value});
        }
      };
      // avoid error "VIDEOJS: ERROR: Unable to find plugin: __ob__"
      if (videoOptions.plugins) {
        delete videoOptions.plugins.__ob__;
      }
      videoOptions.liveui = true;
      // player
      const self = this;
      this.player = videojs(this.$refs.video, videoOptions, function () {
        // events
        const events = DEFAULT_EVENTS.concat(self.events).concat(self.globalEvents);
        // watch events
        const onEdEvents = {};
        for (let i = 0; i < events.length; i++) {
          if (typeof events[i] === 'string' && onEdEvents[events[i]] === undefined) {
            (event => {
              onEdEvents[event] = null;
              this.on(event, () => {
                emitPlayerState(event, true);
              });
            })(events[i]);
          }
        }
        // watch timeupdate
        this.on('timeupdate', function () {
          emitPlayerState('timeupdate', this.currentTime());
        });
        // player ready
        self.$emit('ready', this);
      });
      this.player.player_.handleTechClick_ = function () {
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}): the player was clicked but we are ignoring it`);
        }
      };

      this.setupEvents(this);
    },

    seekable(opName) {
      let prevEvent = this.prevEvents[opName];
      if (!prevEvent) {
        prevEvent = {opName: opName, createdAt: new Date()};
        this.prevEvents[opName] = prevEvent;
      }
      const diff = new Date().getTime() - prevEvent.createdAt.getTime();
      prevEvent.createdAt = new Date();
      if (diff < 50) {
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}): no call due to 50 ms limit for ${prevEvent.opName}. diff: ${diff}`);
        }
        return false;
      }
      return true;
    },

    setupEvents(self) {
      self.player.on('useractive', function () {
        self.$emit('user-activity', {sourceId: self.sourceId, userActive: true});
      });
      self.player.on('userinactive', function () {
        self.$emit('user-activity', {sourceId: self.sourceId, userActive: false});
      });

      if (!this.enableBooster) {
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}): booster mode will not be invoke setupEvents,  exiting now...`);
        }
        return;
      }

      // Open it if a camera which has a bad connection needs this fix. BUt remember handler 404 HLS error. Otherwise, it stacked refreshing.
      self.player.on('error', () => {
        self.seekToLiveEdge(self.player, 'error');
      });
      self.player.on('waiting', () => {
        if (self.seekable('waiting')) {
          self.seekToLiveEdge(self.player, 'waiting');
        }
      });
      self.player.on('suspend', () => {
        if (self.seekable('suspend')) {
          self.seekToLiveEdge(self.player, 'suspend');
        }
      });
      self.player.on('emptied', () => {
        if (self.seekable('emptied')) {
          self.seekToLiveEdge(self.player, 'emptied');
        }
      });
      self.player.on('stalled', () => {
        if (self.seekable('stalled')) {
          self.seekToLiveEdge(self.player, 'stalled');
        }
      });
      self.player.on('durationchange', () => {
        if (self.seekable('error')) {
          self.seekToLiveEdge(self.player, 'durationchange');
        }
      });
    },

    dispose(callback) {
      if (this.player && this.player.dispose) {
        if (this.player.techName_ !== 'Flash') {
          this.player.pause && this.player.pause();
        }
        this.player.dispose();
        this.player = null;
        this.$nextTick(() => {
          this.reset = false;
          this.$nextTick(() => {
            this.reset = true;
            this.$nextTick(() => {
              callback && callback();
            });
          });
        });
      }
    },

    fullScreen() {
      this.player.requestFullscreen();
    },
    pause() {
      this.player.pause();
    },
    seekToLiveEdge(player, by) {
      if (player === undefined || player === null) {
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}): player is empty for ${by}. seek to live edge will not work.`);
        }
        return;
      }
      const elapsedTime = player.liveTracker.liveCurrentTime();
      if (this.enableLog){
        console.log(`HlsPlayer(${this.sourceId}) elapsedTime is ${elapsedTime}`);
      }

      if (elapsedTime > 900.0){//all I can do is 15 minutes
        if (this.enableLog) {
          console.log(`HlsPlayer(${this.sourceId}) needs a refresh since the elapsedTime is ${elapsedTime}`);
        }
        this.$emit('need-refresh', this.sourceId);
        return;
      }

      player.liveTracker.seekToLiveEdge();
      if (this.enableLog) {
        console.log(`HlsPlayer(${this.sourceId}): seeked to live edge at ${new Date().toLocaleString()} by ${by}`);
      }
    },
    setRandomInterval(intervalFunction, minDelay, maxDelay){
      let timeout;
      const runInterval = () => {
        const timeoutFunction = () => {
          intervalFunction();
          runInterval();
        };
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        timeout = setTimeout(timeoutFunction, delay);
      };
      runInterval();
      return {
        clear() { clearTimeout(timeout) },
      };
    }
  },
  watch: {
    options: {
      deep: true,
      handler(options) {
        this.dispose(() => {
          if (options && options.sources && options.sources.length) {
            this.initialize();
          }
        });
      }
    },
    src: {
      handler(src) {
        if (this.options && this.options.sources && this.options.sources.length) {
          this.options.sources[0].src = src;
        }
      }
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
