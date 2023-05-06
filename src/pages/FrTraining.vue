<template>
  <div class='q-pa-md'>
    <q-layout view='hHh Lpr lff' container style='height: 900px' class='shadow-2 rounded-borders'>
      <q-header elevated class='bg-deep-purple-9'>
        <q-toolbar class='bg-deep-purple-9'>
          <q-btn flat round dense icon='menu' @click='drawer = !drawer'/>
          <q-icon name='face' size='28px'/>
          <q-toolbar-title>
            <strong>{{ $t('face_training') }}</strong>
          </q-toolbar-title>
          <q-btn :label="$t('add_new')" icon-right='add' dense color='primary' style='margin-right: 15px' @click='onNew'/>
          <q-btn :label="$t('start_training')" icon-right='engineering' @click='onTraining' :disable='showTrainLoading' color='orange'>
            <q-inner-loading :showing='showTrainLoading'/>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer v-model='drawer' show-if-above :width='300' :breakpoint='500' bordered class='bg-grey-3'>
        <q-scroll-area class='fit'>
          <q-list bordered separator>
            <q-item clickable v-ripple v-for='person in people' :key='person.name' :disable="mode===1"
                    :active='link === person.name' active-class='my-menu-link' @click='onLeftPersonMenuClicked(person)'>
              <q-item-section avatar>
                <q-avatar v-if='person.image_paths&&person.image_paths.length'>
                  <q-img :src='person.image_paths[0]' :alt="$t('no_image')"/>
                </q-avatar>
                <q-icon v-else name="person_outline" />
              </q-item-section>
              <q-item-section>{{ person.name }}</q-item-section>
            </q-item>
            <q-separator/>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-toolbar class='bg-deep-purple-9' style='margin-top: 1px;height: 56px'>
          <q-toolbar-title><label class='text-white' style='font-size: larger;'>{{ selectedPerson.name }}</label></q-toolbar-title>
        </q-toolbar>
        <q-page padding>
          <div class='row wrap justify-start content-stretch'>
            <div class='col-3'>
              <q-form class='q-gutter-md' style="margin-right: 5px;">
                <q-input filled v-model='selectedPerson.name' :label="$t('person_name')" :hint="$t('name_and_surname')"
                         lazy-rules :rules="[ val => val && val.length > 0 || $t('v_type_something')]"/>
                <q-btn v-if='mode===0' :label="$t('rename')" color='deep-purple-9' @click='onRename'
                       :disable='showRenameLoading||!selectedPerson.name'>
                  <q-inner-loading :showing='showRenameLoading'/>
                </q-btn>
                <q-btn v-if='mode===1' :label="$t('create')" color='primary' @click='onAdNewSubmit'
                       :disable='showAdNewSubmitLoading||!selectedPerson.name'>
                  <q-inner-loading :showing='showAdNewSubmitLoading'/>
                </q-btn>
                <q-btn v-if='mode===0' :label="$t('delete')" color='red' @click='onDelete'
                       :disable='showDeleteLoading||!selectedPerson.name'>
                  <q-inner-loading :showing='showDeleteLoading'/>
                </q-btn>
                <q-separator size='2px'/>
                <q-select filled option-value='id' option-label='name' v-model='selectedSource' :options='sourceList'
                          color='deep-purple-9' :label="$t('select_source_to_take_screenshot')" dense :disable='mode===1'/>
                <q-btn :label="$t('screenshot')" icon-right='photo_camera' @click='onTakeScreenshot' :disable='showTakeScreenshot||mode===1'
                       color='deep-purple-9'>
                  <q-inner-loading :showing='showTakeScreenshot'/>
                </q-btn>
                <q-separator size='2px'/>
                <q-responsive :ratio="16/9" class="col">
                  <q-uploader :factory='factoryFn' :label="$t('upload_jpeg_image')" multiple
                              accept='.jpg, image/*' :disable='mode===1'/>
                </q-responsive>
              </q-form>
            </div>
            <div class='col-9'>
              <ViewerComponent style='margin-left: 15px;' v-if='showGallery' :images='images' :show-delete='true' @on-delete='onImageDelete'/>
            </div>
          </div>
          <q-inner-loading :showing='showPageLoading'/>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>
<script lang='ts'>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import ViewerComponent from 'src/components/ViewerComponent.vue';
import {FaceTrainResponseEvent, FrTrainViewModel} from '../utils/models/fr_models';
import {NodeService} from '../utils/services/node_service';
import {ImageItem} from 'src/utils/models/detected';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {WsConnection} from 'src/utils/ws/connection';
import {useQuasar} from 'quasar';
import {List} from 'linqts';
import {SourceModel} from 'src/utils/models/source_model';
import {EditorImageResponseModel} from 'src/utils/entities';
import {isFrDirNameValid, toBase64} from 'src/utils/utils';
import {useI18n} from 'vue-i18n';

export default {
  name: 'FrTraining',
  components: {ViewerComponent},
  setup() {
    const {t} = useI18n({useScope: 'global'});
    const $q = useQuasar();
    const people = ref<FrTrainViewModel[]>([]);
    const selectedPerson = ref<FrTrainViewModel>({name: '', image_paths: []});
    const link = ref<string>('');
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const images = ref<ImageItem[]>([]);
    const showPageLoading = ref<boolean>(false);
    const showGallery = ref<boolean>(true);
    const showTrainLoading = ref<boolean>(false);
    const selectedSource = ref<SourceModel>(nodeService.LocalService.createEmptySource());
    const sourceList = ref<SourceModel[]>([]);
    const showTakeScreenshot = ref<boolean>(false);
    let connFrTrain: WsConnection | null = null;
    let connTakeScreenshot: WsConnection | null = null;
    let prevSelectedPersonName: string | null = null;
    const showRenameLoading = ref<boolean>(false);
    const mode = ref<Mode>(0);
    const showAdNewSubmitLoading = ref<boolean>(false);
    const showDeleteLoading = ref<boolean>(false);

    watch(mode, () => {
      switch (mode.value) {
        case Mode.Add:
          selectedPerson.value = {name: '', image_paths: []};
          images.value = [];
          link.value = '';
          break;
      }
    });

    const dataBindImages = async () => {
      const items = await nodeService.getFrTrainPersons();
      if (items && items.length > 0) {
        for (const item of items) {
          if (item && item.image_paths && item.image_paths.length) {
            for (let j = 0; j < item.image_paths.length; ++j) {
              item.image_paths[j] = await nodeService.LocalService.getNodeAddress(item.image_paths[j]);
            }
          }
        }
        link.value = items[0].name;
        if (selectedPerson.value.name) {
          await onLeftPersonMenuClicked(selectedPerson.value);
        } else {
          await onLeftPersonMenuClicked(items[0]);
        }
      }
      people.value = items;
      return items;
    };

    const onTraining = () => {
      showTrainLoading.value = true;
      void publishService.publishFrTrain();
    };

    function onSubscribeFrTrain(event: MessageEvent) {
      showTrainLoading.value = false;
      const responseEvent: FaceTrainResponseEvent = JSON.parse(event.data);
      $q.notify({
        message: responseEvent.result ? t('training_complete') : t('training_failed'),
        caption: '',
        color: responseEvent.result ? 'green' : 'red'
      });
    }

    function onScreenshotComplete(event: MessageEvent) {
      const sp = selectedPerson.value;
      const responseModel: EditorImageResponseModel = JSON.parse(event.data);
      if (responseModel.id !== selectedSource.value.id || responseModel.event_type != 1) {
        return;
      }
      showTakeScreenshot.value = false;
      if (!responseModel.image_base64) {
        $q.notify({message: t('taking_screenshot_failed'), color: 'red'});
        return;
      }
      nodeService.saveFrTrainPersonImage({name: sp.name, base64_images: [responseModel.image_base64]})
        .then(() => {
          $q.notify({message: t('screenshot_saved'), color: 'green'});
          void dataBindImages();
        }).catch(console.error);
    }

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);
      sourceList.value = await nodeService.getSourceList();
      await dataBindImages();
      connFrTrain = subscribeService.subscribeFrTrain(onSubscribeFrTrain);
      connTakeScreenshot = subscribeService.subscribeEditor('frt', onScreenshotComplete);
    });

    onBeforeUnmount(() => {
      if (connFrTrain) {
        connFrTrain.close();
      }
      if (connTakeScreenshot) {
        connTakeScreenshot.close();
      }
    });

    async function onLeftPersonMenuClicked(person: FrTrainViewModel) {
      prevSelectedPersonName = person?.name;
      selectedPerson.value = person;
      link.value = person.name;

      showPageLoading.value = true;
      try {
        const items = await nodeService.getFrTrainPersonImages(person.name);
        if (items && items.length > 0) {
          for (const item of items) {
            if (item && item.imagePath) {
              item.imagePath = await nodeService.LocalService.getNodeAddress(item.imagePath);
            }
          }
        }
        images.value = items;
      } finally {
        showPageLoading.value = false;
      }
      mode.value = Mode.Edit;
    }

    function onTakeScreenshot() {
      if (!selectedSource.value.id) {
        $q.notify({
          message: t('v_select_source_first'),
          caption: 'Warning',
          color: 'red'
        });
        return;
      }

      const source = new List(sourceList.value).First(x => x?.id === selectedSource.value.id);
      showTakeScreenshot.value = true;
      void publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        address: source.ms_address,
        event_type: 1
      });
    }

    async function onDelete() {
      showDeleteLoading.value = true;
      try {
        await nodeService.deleteFrTrainPerson({name: selectedPerson.value.name});
        mode.value = Mode.Add;
        selectedPerson.value = {name: '', image_paths: []};
        await dataBindImages();
      } finally {
        showDeleteLoading.value = false;
      }
    }

    return {
      drawer: ref<boolean>(true),
      people, selectedPerson, link, images, showPageLoading, showGallery, showTrainLoading, selectedSource, sourceList,
      showTakeScreenshot, showRenameLoading, mode, showAdNewSubmitLoading, showDeleteLoading,
      onLeftPersonMenuClicked, onTraining, onTakeScreenshot,
      async onImageDelete(src: string) {
        await nodeService.deleteFrTrainPersonImage(src);
        showGallery.value = false;
        setTimeout(() => {
          showGallery.value = true;
          void dataBindImages();
        }, 100);
      },
      async factoryFn(files: any) {
        if (!files || !files.length) {
          return false;
        }
        const b64s: string[] = [];
        for (const file of files) {
          const b64: any = await toBase64(file);
          if (!b64 || b64.length < 10) {
            continue;
          }
          b64s.push(b64.split(',')[1])
        }
        if (b64s.length == 0) {
          return false;
        }
        await nodeService.saveFrTrainPersonImage({name: selectedPerson.value.name, base64_images: b64s});
        await dataBindImages();
        return true;
      },
      async onRename() {
        const name = selectedPerson.value.name;
        if (!prevSelectedPersonName || !name || !isFrDirNameValid(name)) {
          $q.notify({message: t('v_enter_valid_name'), color: 'red'});
          return;
        }
        showRenameLoading.value = true;
        try {
          await nodeService.renameFrTrainPersonName({original_name: prevSelectedPersonName, new_name: name});
          await dataBindImages();
          await onLeftPersonMenuClicked(selectedPerson.value);
        } finally {
          showRenameLoading.value = false;
        }
      },
      onNew() {
        mode.value = Mode.Add;
      },
      async onAdNewSubmit() {
        showAdNewSubmitLoading.value = true;
        try {
          const result = await nodeService.newFrTrainPerson({name: selectedPerson.value.name});
          if (result) {
            mode.value = Mode.Edit;
            await dataBindImages();
            await onLeftPersonMenuClicked(selectedPerson.value);
          }
        } finally {
          showAdNewSubmitLoading.value = false;
        }
      },
      onDelete() {
        $q.dialog({
          title: t('confirm'),
          message: t('are_you_sure_delete_person'),
          cancel: true,
          persistent: false
        }).onOk(() => {
          void onDelete();
        });
      }
    };
  }
};

enum Mode {
  Edit = 0,
  Add = 1
}
</script>

<style scoped>
.my-menu-link {
  color: white;
  background: #4527a0;
}
</style>
