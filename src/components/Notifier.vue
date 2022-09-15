<template>
  <q-btn round dense flat color="grey-8" icon="notifications">
    <q-badge v-show="noShownLength" color="red" text-color="white" floating>
      {{noShownLength}}{{noShownLength > 9 ? '+' : ''}}
    </q-badge>
    <q-tooltip>{{$t('notifications')}}</q-tooltip>
    <q-popup-proxy @show="onPopupShow" v-model="popupShow">
      <q-list bordered class="rounded-borders" style="max-width: 350px">
        <q-item-label v-show="list.length" header>{{$t('notifications')}}</q-item-label>
        <q-item v-for="item in list" v-ripple :key="item.id" >
          <q-item-section avatar>
<!--            <q-avatar size="75px">-->
<!--              <q-img :src="'data:image/png;base64, ' + item.base64_image" spinner-color='white'/>-->
<!--            </q-avatar>-->
            <q-img :src="'data:image/jpg;base64, ' + item.base64_image" spinner-color='white' width="80px" style="cursor: pointer;"
                   @click="onOpenImageNewWindow(item.base64_image)"/>
          </q-item-section>


          <q-item-section>
            <q-item-label caption lines="2">
              <span class="text-weight-bold">{{item.source_name}}</span>
              {{item.detects}}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <span class="text-weight-bold" style="font-size: xx-small">{{item.time_since}} {{$t('ago')}}</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-popup-proxy>
  </q-btn>
</template>

<script lang="ts">
import {NodeService} from 'src/utils/services/node_service';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {NotifierResponseEvent} from 'src/utils/models/various';
import {WsConnection} from 'src/utils/ws/connection';
import {SubscribeService} from 'src/utils/services/websocket_services';
import {ObjectDetectionModel} from 'src/utils/models/od_model';
import {cutFloatString, myDateToJsDate, timeSince} from 'src/utils/utils';
import {FaceRecognitionModel} from 'src/utils/models/fr_models';
import {AlprResponse} from 'src/utils/models/alpr_models';
import {List} from 'linqts';
import {v4 as uuidv4} from 'uuid';
import {useI18n} from 'vue-i18n';

export default {
  name: 'Notifier',
  setup(){
    const { t } = useI18n({ useScope: 'global' });
    const list = ref<NotificationViewModel[]>([]);
    const noShownLength = computed(() => {
      return new List(list.value).Count(x => x?.shown === false);
    })
    const popupShow = ref<boolean>(false);
    const nodeService = new NodeService();
    const cachedSources:any = {};
    let notifierConnection: WsConnection | null = null;
    let timeSinceInterval: NodeJS.Timer | null;
    const notifyFailedBase64Img = ' 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';

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);
      notifierConnection = subscribeService.subscribeNotifier(async (event: MessageEvent) =>{
        const responseModel: NotifierResponseEvent = JSON.parse(event.data);
        if (responseModel?.base_64_object){
          switch (responseModel.type){
            case 0:
              await addOdItem(responseModel);
              break;
            case 1:
              await addFrItem(responseModel);
              break;
            case 2:
              await addLprItem(responseModel);
              break;
            case 3:
              await addNotifyFailed(responseModel);
              break;
          }
        }
        window.addEventListener('resize', function() {
          popupShow.value = false;
        });
      });

      timeSinceInterval = setInterval(() => {
        for(const i of list.value){
          if (i.created_at){
            i.time_since = timeSince(i.created_at, t);
          }
        }
      }, 1000);

    });

    onBeforeUnmount(() => {
      notifierConnection?.close();
      if (timeSinceInterval){
        clearInterval(timeSinceInterval);
      }
    });

    const addCachedSource = async (sourceId: string) => {
      cachedSources[sourceId] = await nodeService.getSource(sourceId);
    }

    const setUpTimes = (model: any): NotificationViewModel => {
      const item: NotificationViewModel = {shown:popupShow.value};
      item.source_name = cachedSources[model.source_id].name;
      if (model.created_at){
        item.created_at = myDateToJsDate(model.created_at);
        item.time_since = timeSince(item.created_at, t);
      }else{
        item.time_since = '';
      }

      return item;
    }

    const setupImage = (source: any, dest: NotificationViewModel) => {
      dest.base64_image = source.base64_image;
      dest.id = source.id;
      list.value.splice(0, 0, dest);
      if (list.value.length > 10){
        list.value.length = 10;
      }
    };

    async function addOdItem(responseModel: NotifierResponseEvent){
      const odm: ObjectDetectionModel = JSON.parse(atob(responseModel.base_64_object));
      if (!odm || !odm.source_id){
        return;
      }
      if (!(odm.source_id in cachedSources)){
        await addCachedSource(odm.source_id);
      }
      const item: NotificationViewModel = setUpTimes(odm);
      if (odm.detected_objects&&odm.detected_objects.length){
        const arr:string[] = [];
        for (const d of odm.detected_objects){
          arr.push(`${d.pred_cls_name}`);
        }
        if (arr.length > 0){
          item.detects = arr.join(',');
        }
      }
      setupImage(odm, item);
    }

    async function addFrItem(responseModel: NotifierResponseEvent){
      const frm: FaceRecognitionModel = JSON.parse(atob(responseModel.base_64_object));
      if (!frm || !frm.source_id){
        return;
      }
      if (!(frm.source_id in cachedSources)){
        await addCachedSource(frm.source_id);
      }
      const item: NotificationViewModel = setUpTimes(frm);
      if (frm.detected_faces&&frm.detected_faces.length){
        const arr:string[] = [];
        for (const f of frm.detected_faces){
          arr.push(`${f.pred_cls_name}(${cutFloatString(f.pred_score)})`);
        }
        if (arr.length > 0){
          item.detects = arr.join(', ');
        }
      }
      setupImage(frm, item);
    }

    async function addLprItem(responseModel: NotifierResponseEvent){
      const alrp: AlprResponse =  JSON.parse(atob(responseModel.base_64_object));
      if (!alrp || !alrp.source_id){
        return;
      }
      if (!(alrp.source_id in cachedSources)){
        await addCachedSource(alrp.source_id);
      }
      const item: NotificationViewModel = setUpTimes(alrp);
      if (alrp.results&&alrp.results.length){
        const arr:string[] = [];
        for (const l of alrp.results){
          arr.push(`${l.plate}(${cutFloatString(l.confidence)})`);
        }
        if (arr.length > 0){
          item.detects = arr.join(',');
        }
      }
      setupImage(alrp, item);
    }

    async function addNotifyFailed(responseModel: NotifierResponseEvent){
      const notifyFailed: NotifyFailedStreamModel =  JSON.parse(atob(responseModel.base_64_object));
      if (!notifyFailed || !notifyFailed.id){
        return;
      }
      if (!(notifyFailed.id in cachedSources)){
        await addCachedSource(notifyFailed.id);
      }
      //@ts-ignore
      notifyFailed.source_id = notifyFailed.id;
      let reason = '';
      const item: NotificationViewModel = setUpTimes(notifyFailed);
      switch (notifyFailed.failure_reason){
        case 'check_rtmp_container':
          reason = `RTMP ${t('server')} ${t('failed')}`;
          break;
        case 'check_rtmp_feeder_process':
          reason = `Feeder ${t('process')} ${t('failed')}`;
          break;
        case 'check_hls_process':
          reason = `HLS ${t('process')} ${t('failed')}`;
          break;
        case 'check_mp_ffmpeg_reader_process':
          reason = `AI Reader ${t('process')} ${t('failed')}`;
          break;
        case 'check_record_process':
          reason = `Recording ${t('process')} ${t('failed')}`;
          break;
        case 'check_snapshot_process':
          reason = `Snapshot ${t('process')} ${t('failed')}`;
          break;
        case 'check_record_stuck_process':
          reason = `Recording ${t('process')} ${t('stuck')}`;
          break;
      }
      item.detects = notifyFailed.name + t('hasbeenfailed') + reason;

      //@ts-ignore
      notifyFailed.base64_image = notifyFailedBase64Img;
      notifyFailed.id = uuidv4();

      setupImage(notifyFailed, item);
    }

    const onPopupShow = () => {
      for(const item of list.value){
        item.shown = true;
      }
    }

    return{
      list, noShownLength, popupShow,
      onPopupShow,
      onOpenImageNewWindow(base64Img: string){
        const image = new Image();
        image.src = 'data:image/jpg;base64,' + base64Img;

        const w: any = window.open('');
        w.document.write(image.outerHTML);
      }
    }
  }
}
interface NotificationViewModel {
  source_name?:string;
  detects?:string;
  created_at?:Date;
  time_since?:string;
  base64_image?: string;
  id?:string;
  shown:boolean
}

interface NotifyFailedStreamModel{
  failure_reason: string;
  id:string;
  brand:string;
  name:string;
  address:string;
  created_at: string;
}
</script>

<style scoped>

</style>
