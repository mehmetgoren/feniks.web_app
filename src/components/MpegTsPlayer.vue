<template>
  <div style='width: 100%;height: 100%;'>
    <video :id="videoId" controls preload='auto' autoplay muted @mouseover="onMouseOver" @mouseleave="onMouseLeave" class="mpegts-player"
           style='width: 100%;height: 100%;'>
      Your browser is too old which doesn't support HTML5 video.
    </video>
  </div>
</template>

<script lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import mpegts from 'mpegts.js'
import {v4 as uuidv4} from 'uuid';
import {isNullOrUndefined} from 'src/utils/utils';

export default {
  name: 'MpegTsPlayer',
  emits: ['user-activity'],
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
    galleryIndex: {
      type: Number,
      default: 0
    },
    liveBufferLatencyChasing: {
      type: Boolean,
      default: true
    },
  },
  //@ts-ignore
  setup(props: any, {emit}) {
    const videoId = ref<string>(uuidv4());
    let player: mpegts.Player | null = null;
    const featureList = mpegts.getFeatureList();
    let block = false;

    onMounted(() => {
      if (props.enableLog) {
        console.log(`MpegTsPlayer(${props.sourceId}) isSupported: ${mpegts.isSupported()}`);
      }
      let liveBufferLatencyChasing = true;
      if (!isNullOrUndefined(props.liveBufferLatencyChasing) && props.liveBufferLatencyChasing === false) {
        liveBufferLatencyChasing = false;
      }

      if (featureList.mseLivePlayback) {
        const videoElement = document.getElementById(videoId.value);
        if (!videoElement) {
          return;
        }
        player = mpegts.createPlayer({
          type: PlayTypes.mse,
          isLive: true,
          url: props.src
        }, {
          liveBufferLatencyChasing: liveBufferLatencyChasing,
          liveBufferLatencyMaxLatency: 3.,
          liveBufferLatencyMinRemain: 1.,
          enableStashBuffer: false,
          autoCleanupSourceBuffer: true,
        });
        player.attachMediaElement(<HTMLMediaElement>videoElement);
        player.load();
        void player.play();
        videoElement.addEventListener('pause', () => {
          //@ts-ignore
          void player.play();
        });
      }
    });

    onBeforeUnmount(() => {
      if (player) {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
        player = null;
        if (props.enableLog) {
          console.log(`MpegTsPlayer(${props.sourceId}): the player has been disposed at ${new Date().toLocaleString()}`);
        }
      }
    });

    return {
      videoId,
      onMouseOver() {
        emit('user-activity', {sourceId: props.sourceId, userActive: true});
      },
      onMouseLeave() {
        if (block) return;
        block = true;
        setTimeout(() => {
          emit('user-activity', {sourceId: props.sourceId, userActive: false});
          block = false;
        }, 3000);
      }
    }
  }
}

enum PlayTypes {
  mse = 'mse',
  mpegts = 'mpegts',
  m2ts = 'm2ts',
  flv = 'flv'
}
</script>

<style scoped>
.mpegts-player {
  /*pointer-events: none;*/
}

audio::-webkit-media-controls-timeline,
video::-webkit-media-controls-timeline {
  display: none;
}

audio::-webkit-media-controls-play-button,
video::-webkit-media-controls-play-button {
  display: none;
}

audio::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-current-time-display {
  display: none;
}

/*audio::-webkit-media-controls,*/
/*video::-webkit-media-controls {*/
/*  display: none;*/
/*}*/
</style>
