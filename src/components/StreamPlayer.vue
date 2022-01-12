<template>
  <div class='video-player' v-if='reset'>
    <video class='video-js' ref='video'>
      <track v-for='crtTrack in trackList' :kind='crtTrack.kind' :label='crtTrack.label' :src='crtTrack.src'
             :key='crtTrack.src'
             :srcLang='crtTrack.srcLang' :default='crtTrack.default' />
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
  name: 'StreamPlayer',
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
    srcId: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      player: null,
      reset: true,
      options: {
        autoplay: true,
        muted: true,
        fluid: true,
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
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.dispose();
      console.info('Stream Player was destroyed');
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
          this.$emit(this.customEventName, { [event]: value });
        }
      };
      // avoid error "VIDEOJS: ERROR: Unable to find plugin: __ob__"
      if (videoOptions.plugins) {
        delete videoOptions.plugins.__ob__;
      }

      // player
      const self = this;
      self.player = videojs(this.$refs.video, videoOptions, function() {
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
        this.on('timeupdate', function() {
          emitPlayerState('timeupdate', this.currentTime());
        });
        // player ready
        self.$emit('ready', this);
      });
      self.player.player_.handleTechClick_ = function() {
        console.log('the player was clicked but we\'re ignoring it');
      };

      self.player.on('error', () => {
        console.log(self.srcId +  ' omg error oldu!!!');
        self.$emit('needReload', self.srcId, 'error')
      });
      self.player.on('waiting', ()=> {
        console.log(self.srcId +  ' omg waiting oldu!!!');
        self.$emit('needReload', self.srcId, 'waiting')
      });
      self.player.on('suspend', ()=> {
        console.log(self.srcId +  ' omg suspend oldu!!!');
      });
      self.player.on('emptied', ()=> {
        console.log(self.srcId +  ' omg emptied oldu!!!');
      });
      self.player.on('stalled', ()=> {
        console.log(self.srcId +  ' omg stalled oldu!!!');
      });
      self.player.on('seeking', ()=> {
        console.log(self.srcId +  ' omg seeking oldu!!!');
      });
      self.player.on('seeked', ()=> {
        console.log(self.srcId +  ' omg seeked oldu!!!');
      });
      self.player.on('durationchange', ()=> {
        console.log(self.srcId +  ' omg durationchange oldu!!!');
      });
      // self.player.on('timeupdate', ()=> {
      //   console.log(self.srcId +  ' omg timeupdate oldu!!!');
      // });
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
