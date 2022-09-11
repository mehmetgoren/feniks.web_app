<template>
  <div>
    <q-toolbar :class="'bg-' + color + ' text-white'">
      <q-btn flat dense icon="lens_blur" class="q-mr-sm"/>
      <q-toolbar-title>{{$t('ai_event_data_history')}}</q-toolbar-title>
      <q-tabs v-model="tab" shrink :active-bg-color="color">
        <q-tab name="od" icon="collections" :label="$t('object_detection')"/>
        <q-tab name="fr" icon="face" :label="$t('face_recognition')"/>
        <q-tab name="alpr" icon="drive_eta" :label="$t('license_plate_recognition')"/>
      </q-tabs>
      <q-space/>
    </q-toolbar>
    <div class='q-pa-md q-gutter-sm' style='margin-top: -15px;'>
      <div class="row">
        <div class="col-3">
          <DateTimeSelector width-date="187" :dense="true" :color='color' :show-hour='true' :label-date="$t('date')" :label-time="$t('time')"
                            @date-changed='onDateChanged' @hour-changed='onHourChanged'/>
          <q-toggle dense v-model='params.no_preparing_video_file' :color='color' @update:model-value='onNoPreparingVideoFileChanged'
                    :label="params.no_preparing_video_file ? $t('include_preparing_video_file') : $t('do_not_include_preparing_video_file') " />
          <q-input dense filled v-model.trim='params.pred_class_name' :label="$t('label')" :color='color' @update:model-value="onLabelChanged" style="width: 300px" />
        </div>
        <div class="col-9">
          <q-toolbar :class="'bg-' + color + ' text-white'">
            <q-icon :name="selectedFeature.icon" size="24px" />
            <q-toolbar-title style="width: 100%">{{selectedFeature.name}}</q-toolbar-title>
          </q-toolbar>
        </div>
      </div>
      <div class="row">
        <div class="col-3">
          <div style="max-width: 90%; width: 300px; height: 750px;">
            <q-scroll-area class='fit'>
              <q-intersection v-for="leftItem in leftItems" :key="leftItem.id" transition="flip-right" class="example-item"
                              @click="onLeftItemChanged(leftItem)">
                <q-item :clickable="isVfAvailable(leftItem)" :v-ripple="isVfAvailable(leftItem)" :data-id="leftItem.id"
                        :active="leftItem.id===selectedItem?.id"
                        active-class="bg-teal-1 text-grey-8">
                  <q-item-section avatar>
                    <q-avatar :color="color" text-color="white">
                      {{ leftItem.pred_cls_name[0].toUpperCase() }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ leftItem.pred_cls_name }}</q-item-label>
                    <q-item-label caption lines="1">{{ leftItem.created_at?.toLocaleTimeString() }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-icon name="chat_bubble" color="green"/>
                    {{ leftItem.pred_score }}
                  </q-item-section>

                  <q-inner-loading :showing="!isVfAvailable(leftItem)" :label="$t('preparing') + '...'" label-class="text-teal"
                                   label-style="font-size: 1.1em" :color="color" size="16px"/>

                </q-item>
              </q-intersection>
              <q-inner-loading :showing="leftPanelLoading">
                <q-spinner-gears size="50px" :color="color" />
              </q-inner-loading>
            </q-scroll-area>
          </div>
        </div>
        <div class="col-9" style="margin-top: -65px;">
          <VideoPlayer :auto-play="true" @on-player-ready="onVideoPlayerReady" style="float: left;width: 50%"/>
          <q-img v-if="selectedItem" :src="selectedItem.image_file_name" style="float: left;width: 50%">
            <div class="absolute-bottom text-center">
              {{selectedItem.pred_cls_name}} ({{selectedItem.pred_score}}) at {{selectedItem.created_at?.toLocaleTimeString()}} / {{selectedItem.video_file.object_appears_at}} sec.
            </div>
          </q-img>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {onMounted, ref, watch} from 'vue';
import {getCurrentHour, getTodayString} from 'src/utils/utils';
import DateTimeSelector from 'src/components/DateTimeSelector.vue';
import {NodeService} from 'src/utils/services/node_service';
import {AiDataDto, QueryAiDataParams, SelectedAiFeature} from 'src/utils/models/ai_data_dtos';
import VideoPlayer from 'components/VideoPlayer.vue';
import {setUpDatesAndPaths} from 'src/utils/path_utils';
import {useI18n} from 'vue-i18n';

export default {
  name: 'AiDataSource',
  props: {
    sourceId: {
      type: String,
      required: true
    }
  },
  components: {
    VideoPlayer,
    DateTimeSelector
  },
  setup(props: any) {
    const { t } = useI18n({ useScope: 'global' });
    const tab = ref<string>('od')
    const params = ref<QueryAiDataParams>({
      ai_type: 0,
      source_id: props.sourceId,
      date_time_str: '',
      pred_class_name: '',
      no_preparing_video_file: true,
    });
    watch(tab, (newValue: string) => {
      switch (newValue) {
        case 'od':
          color.value = 'deep-purple-14';
          params.value.ai_type = 0;
          selectedFeature.value.name = t('object_detection');
          selectedFeature.value.icon = 'collections';
          void databind();
          break;
        case 'fr':
          color.value = 'deep-orange-7';
          params.value.ai_type = 1;
          selectedFeature.value.name = t('face_recognition');
          selectedFeature.value.icon = 'face';
          void databind();
          break;
        case 'alpr':
          color.value = 'blue-grey-6';
          params.value.ai_type = 2;
          selectedFeature.value.name = t('license_plate_recognition');
          selectedFeature.value.icon = 'drive_eta';
          void databind();
          break;
      }
    })
    const color = ref<string>('deep-purple-14')
    let selectedDate = getTodayString();
    let selectedHour = getCurrentHour();
    const nodeService = new NodeService();
    const leftItems = ref<AiDataDto[]>([]);
    const selectedItem = ref<AiDataDto | null>(null);
    const leftPanelLoading = ref<boolean>(false);
    const selectedFeature = ref<SelectedAiFeature>({name:t('object_detection'), icon:'collections'});
    let videoPlayer: any = null;

    const databind = async () => {
      leftPanelLoading.value = true;
      try{
        params.value.date_time_str = `${selectedDate}_${selectedHour}`;
        const items = await nodeService.queryAiData(params.value);
        leftItems.value = await setUpDatesAndPaths(nodeService.LocalService, items);
        if (items.length > 0) {
          const firstItem = leftItems.value[0];
          selectedItem.value = firstItem;
          onLeftItemChanged(firstItem);
        }
      }finally {
        leftPanelLoading.value = false;
      }
    };

    onMounted(async () => {
      await databind();
    });

    const onLeftItemChanged = (leftItem: AiDataDto) => {
      if (isVfAvailable(leftItem)) {
        selectedItem.value = leftItem;
        if (videoPlayer != null){
          videoPlayer.src(leftItem.video_file.name);
          videoPlayer.currentTime(Math.max(leftItem.video_file.object_appears_at-2, 0));
          videoPlayer.play();
        }
      }
    }

    const isVfAvailable = (item: AiDataDto): boolean => {
      return (item?.video_file?.name?.length ?? 0) > 0;
    };

    const onVideoPlayerReady = (player: any) => {
      videoPlayer = player;
    }

    return {
      tab, color, selectedDate, selectedHour, leftItems, selectedItem, params, leftPanelLoading, selectedFeature,
      onDateChanged(dateStr: string) {
        selectedDate = dateStr;
        void databind();
      },
      onHourChanged(hour: string) {
        selectedHour = hour;
        void databind();
      },
      onNoPreparingVideoFileChanged() {
        void databind();
      },
      onLabelChanged(){
        void databind();
      },
      onLeftItemChanged, isVfAvailable, onVideoPlayerReady
    }
  }
}
</script>

<style lang="sass" scoped>
.example-item
  height: 56px
</style>
