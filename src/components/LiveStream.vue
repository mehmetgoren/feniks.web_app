<template>
  <div v-for='src in srcList' :key='src' style='width: 600px;height: 400px;margin: 60px auto 0;'>
    <StreamPlayer  class="video-player-box"
                   ref="videoPlayer"
                   :src="src"
                   :playsinline="true">
    </StreamPlayer>
  </div>
</template>

<script lang='ts'>
import {
  onMounted, reactive,
} from 'vue';
import { WsConnection } from 'src/utils/ws/connection';
import { StreamingEvent } from 'src/utils/entities';
import StreamPlayer from 'components/StreamPlayer.vue';
import { List } from 'linqts';

export default {
  name: 'LiveStream',
  components: {
    StreamPlayer
  },
  setup() {
    const srcList = reactive<Array<string>>([]);

    onMounted(() => {
      new WsConnection('wsstreaming', (event: MessageEvent) => {
        const source: StreamingEvent = JSON.parse(event.data);
        const url = 'http://localhost:2072/livestream/' + source.output_file
        if (new List<string>(srcList).FirstOrDefault(x => x == url) == null) {
          srcList.push(url);
        }
      });
    });

    return {
      srcList,
    };
  }
};
</script>
