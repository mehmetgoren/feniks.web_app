<template>
  <q-btn round dense flat color="grey-8" icon="notifications">
    <q-badge v-show="noShownLength" color="red" text-color="white" floating>
      {{noShownLength}}{{noShownLength > 9 ? '+' : ''}}
    </q-badge>
    <q-tooltip>Notifications</q-tooltip>
    <q-popup-proxy @show="onPopupShow" v-model="popupShow">
      <q-list bordered class="rounded-borders" style="max-width: 350px">
        <q-item-label v-show="list.length" header>Notifications</q-item-label>
        <q-item v-for="item in list" v-ripple :key="item.id">
          <q-item-section avatar>
<!--            <q-avatar size="75px">-->
<!--              <q-img :src="'data:image/png;base64, ' + item.base64_image" spinner-color='white'/>-->
<!--            </q-avatar>-->
            <q-img :src="'data:image/png;base64, ' + item.base64_image" spinner-color='white' width="80px"/>
          </q-item-section>


          <q-item-section>
            <q-item-label caption lines="2">
              <span class="text-weight-bold">{{item.source_name}}</span>
              {{item.detects}}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <span class="text-weight-bold" style="font-size: xx-small">{{item.time_since}} ago</span>
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

export default {
  name: 'Notifier',
  setup(){
    const list = ref<NotificationViewModel[]>([]);
    const noShownLength = computed(() => {
      return new List(list.value).Count(x => x?.shown === false);
    })
    const popupShow = ref<boolean>(false);
    const nodeService = new NodeService();
    const cachedSources:any = {};
    let notifierConnection: WsConnection | null = null;
    let timeSinceInterval: NodeJS.Timer | null;

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const subscribeService = new SubscribeService(nodeIp);
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
          }
        }
      });

      timeSinceInterval = setInterval(() => {
        for(const i of list.value){
          if (i.created_at){
            i.time_since = timeSince(i.created_at);
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
        item.time_since = timeSince(item.created_at);
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

    const onPopupShow = () => {
      for(const item of list.value){
        item.shown = true;
      }
    }

    return{
      list, noShownLength, popupShow,
      onPopupShow
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
</script>

<style scoped>

</style>
