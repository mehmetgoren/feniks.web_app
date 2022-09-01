<template>
  <q-layout view='hHh lpR fFf' class='bg-grey-1'>
    <q-header elevated class='bg-white text-grey-8'>
      <q-toolbar class='GNL__toolbar'>
        <q-toolbar-title shrink class='row items-center no-wrap'>
          <q-img src='../../public/icons/logo.png' style="cursor: pointer; width: 60px;" @click='toggleLeftDrawer'/>
        </q-toolbar-title>
        <ServerStatsBar/>
        <q-space/>
        <!--  left panel panel-->
        <div class='q-gutter-sm row items-center no-wrap'>
          <Notifier style="margin-right: -15px"/>
          <q-btn-dropdown icon='account_circle' round flat :label='currentUser?.username'>
            <q-list>
              <q-item clickable v-close-popup @click='onLogoutUser'>
                <q-item-section>
                  <q-item-label>
                    <q-avatar size='36px'>
                      <q-icon name='logout'/>
                    </q-avatar>
                    Logout
                    <q-tooltip>Logout</q-tooltip>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

          </q-btn-dropdown>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer v-model='leftDrawerOpen' show-if-above bordered class='bg-white' :width='280'>
      <q-scroll-area class='fit'>
        <q-list padding class='text-grey-8'>
          <div v-for='(menu, index) in menus' :key='index'>
            <q-item v-for='link in menu' :key='link.text' class='GNL__drawer-item'
                    :active='!link.isSource&&link.name&&activeLeftMenu===link.name' active-class='my-menu-link'>
              <q-item-section avatar v-if='!link.isSource' style='cursor: pointer;' v-ripple @click='onLeftMenuClick(link)'>
                <q-icon v-if='!link.isSource' :name='link.icon'/>
              </q-item-section>
              <q-item-section v-if='!link.isSource' style='cursor: pointer;' v-ripple @click='onLeftMenuClick(link)'>
                <q-item-label>{{ link.text }}</q-item-label>
              </q-item-section>
              <q-item-section v-if='link.isSource'>
                <q-img :src="'data:image/png;base64, ' + (link.thumbnail ? link.thumbnail : emptyBase64Image)" spinner-color='white'
                       style='height: 80px; width: 200px; cursor: pointer;' class='rounded-borders'>
                  <div class='absolute-bottom text-subtitle1'>
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].streaming' name='live_tv' color='green'
                            style='margin-right: 3px;'
                            class='blink_me'/>
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].recording' name='fiber_manual_record' color='red'
                            style='margin-right: 3px;' class='blink_me'/>
                    <q-icon :name='link.icon'/>
                    {{ link.text }}
                  </div>
                  <q-inner-loading v-if='loadingObject[link.id]' :showing='true' label='Please wait...' label-class='text-cyan'
                                   label-style='font-size: 1.1em'>
                    <q-spinner-hourglass size='75%' color='cyan'/>
                  </q-inner-loading>
                </q-img>
              </q-item-section>
              <q-btn-dropdown v-if='link.isSource' color='primary' dropdown-icon='settings' :dense='true'>
                <q-list>
                  <q-item clickable v-close-popup @click='onStartStreaming(link)' v-ripple>
                    <q-item-section side>
                      <q-icon name='live_tv' color='cyan'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Start Streaming</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onSaveSettingsClicked(link.id)' v-ripple>
                    <q-item-section side>
                      <q-icon name='settings' color='cyan'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Settings</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onShowRecordClicked(link.id)'>
                    <q-item-section side>
                      <q-icon name='dvr' color='purple'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Playback</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onAiClick(link.id)'>
                    <q-item-section side>
                      <q-icon name='psychology' color='orange'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>AI</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onOnvifClick(link)'>
                    <q-item-section side>
                      <q-icon name='settings_ethernet' color='brown-5'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>ONVIF</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onTakeScreenshotClicked(link)'>
                    <q-item-section side>
                      <q-icon name='photo_camera' color='purple'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Take a screenshot</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-item clickable v-close-popup @click='getThumbnail(link.source)'>
                  <q-item-section side>
                    <q-icon name='center_focus_strong' color='purple'/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Test</q-item-label>
                  </q-item-section>
                </q-item>
                <!--                <q-inner-loading v-if='loadingObject[link.id]' :showing='true'>-->
                <!--                  <q-spinner-gears size='50px' color='primary' />-->
                <!--                </q-inner-loading>-->
              </q-btn-dropdown>
            </q-item>
            <q-separator v-if='menu.length' inset class='q-my-sm'/>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :source-id='selectedSourceId' @on-save='onSourceSettingsSave' @on-delete='onSourceDelete'/>
  </q-dialog>

  <q-dialog v-model='showRecords' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecords :source-id='selectedSourceId'/>
  </q-dialog>

  <q-dialog v-model='showOnvif' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <OnvifSettings :address='selectedSourceAddress' :color='"brown-5"'/>
  </q-dialog>
</template>

<script lang='ts'>
import {onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {NodeService} from 'src/utils/services/node_service';
import {LoadingInfo, MenuLink, StreamCommandBarInfo, StreamCommandBarActions} from 'src/store/module-settings/state';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {EditorImageResponseModel} from 'src/utils/entities';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecords from 'components/SourceRecords.vue';
import OnvifSettings from 'components/OnvifSettings.vue';
import ServerStatsBar from 'components/ServerStatsBar.vue';
import {SourceModel} from 'src/utils/models/source_model';
import {createEmptyBase64Image, doUserLogout, startStream} from 'src/utils/utils';
import {StoreService} from 'src/utils/services/store_service';
import {WsConnection} from 'src/utils/ws/connection';
import Notifier from 'components/Notifier.vue';

export default {
  name: 'Ionix Layout',
  components: {
    SourceSettings, SourceRecords, OnvifSettings,
    ServerStatsBar, Notifier
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const leftDrawerOpen = ref(false);
    const nodeService = new NodeService();
    const localService = nodeService.LocalService;
    const publishService = new PublishService();
    const storeService = new StoreService();
    const loadingObject = reactive<any>({});
    const sourceStreamStatus = reactive<any>({});
    const showSettings = ref<boolean>(false);
    const showRecords = ref<boolean>(false);
    const selectedSourceId = ref<string>('');
    const emptyBase64Image = ref<string>(createEmptyBase64Image());
    const activeLeftMenu = ref<string>('config');
    const selectedSourceAddress = ref<string>('');
    const showOnvif = ref<boolean>(false);
    const menus = ref(storeService.getNode());
    let editorConnection: WsConnection | null = null;

    const loadSources = async () => {
      const sources = await nodeService.getSourceList();
      for (const source of sources) {
        storeService.addSourceToLeftMenu(source);
        setTimeout(() => {
          _getThumbnail(source);
        });
        loadingObject[<string>source.id] = false;
      }
    };

    async function sourceStreamDatabind() {
      const sourceStreamStatusList = await nodeService.getSourceStreamStatus();
      for (const item of sourceStreamStatusList) {
        sourceStreamStatus[item.id] = item;
      }
    }

    const sourceLoading = storeService.sourceLoading;
    watch(sourceLoading, (obj: LoadingInfo) => {
      loadingObject[obj.id] = obj.loading;
    });

    const sourceStreamStatusChanged = storeService.sourceStreamStatusChanged;
    watch(sourceStreamStatusChanged, async () => {
      await sourceStreamDatabind();
    });

    const clickedStreamCommandBar = storeService.clickedStreamCommandBar;
    watch(clickedStreamCommandBar, (info: StreamCommandBarInfo) => {
      switch (info.action) {
        case  StreamCommandBarActions.ShowSourceSettings:
          selectedSourceId.value = info.source.id;
          showSettings.value = true;
          break;
        case StreamCommandBarActions.ShowSourceRecords:
          selectedSourceId.value = info.source.id;
          showRecords.value = true;
          break;
        case StreamCommandBarActions.ShowOnvifSettings:
          selectedSourceAddress.value = info.source.address;
          showOnvif.value = true;
          break;
        case StreamCommandBarActions.CloseSourceSettings:
          selectedSourceId.value = info.source.id;
          showSettings.value = false;
          break;
      }
    });

    onMounted(async () => {
      const currentPath = route.path;
      if (currentPath) {
        activeLeftMenu.value = currentPath.replace('/', '');
      }
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const nodePort = await nodeService.LocalService.getNodePort();
      const subscribeService = new SubscribeService(nodeIp, nodePort);
      editorConnection = subscribeService.subscribeEditor('ml', (event: MessageEvent) => {
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        switch (responseModel.event_type) {
          case 1:
            window.location.href = 'data:application/octet-stream;base64,' + responseModel.image_base64;
            break
          case 2:
            storeService.setSourceThumbnail(responseModel);
            localService.saveThumbnail(responseModel.id ?? '', responseModel.image_base64);
            break
        }
        storeService.setSourceLoading(<string>responseModel.id, false);
      });

      await loadSources();
      await sourceStreamDatabind();
    });

    onBeforeUnmount(() => {
      editorConnection?.close();
    });

    const currentUser = storeService.currentUser;

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function _getThumbnail(source: SourceModel) {
      const thumbnail = localService.getThumbnail(source.id ?? '');
      if (thumbnail) {
        storeService.setSourceThumbnail({
          id: source.id,
          name: source.name,
          brand: source.brand,
          address: source.address,
          event_type: 2,
          image_base64: thumbnail
        });
      } else {
        getThumbnail(source);
      }
    }

    function getThumbnail(source: SourceModel) {
      publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        address: source.address,
        event_type: 2
      }).then().catch(console.error);
      const sourceId = <string>source.id;
      storeService.setSourceLoading(sourceId, true);
      setTimeout(() => {
        storeService.setSourceLoading(sourceId, false);
      }, 30000);
    }

    const onAiClick = (sourceId: string) => {
      storeService.setAiSettingsSourceId(sourceId);
      void router.push('ai_settings');
    };

    const onLogoutUser = async () => {
      await nodeService.logoutUser(currentUser.value);
      await doUserLogout(nodeService.LocalService, storeService, router);
    };

    return {
      leftDrawerOpen,
      menus,
      currentUser,
      loadingObject,
      sourceStreamStatus,
      showSettings,
      selectedSourceId,
      showRecords,
      emptyBase64Image,
      activeLeftMenu,
      selectedSourceAddress,
      showOnvif,
      toggleLeftDrawer,
      getThumbnail,
      onAiClick,
      onLogoutUser,
      onSaveSettingsClicked(sourceId: string) {
        showSettings.value = true;
        selectedSourceId.value = sourceId;
      },
      onStartStreaming(link: MenuLink) {
        startStream(storeService, publishService, <SourceModel>link.source);
      },
      onShowRecordClicked(sourceId: string) {
        showRecords.value = true;
        selectedSourceId.value = sourceId;
      },
      onTakeScreenshotClicked(link: MenuLink) {
        const source = <SourceModel>link.source;
        void publishService.publishEditor({
          id: source.id,
          brand: source.brand,
          name: source.name,
          address: source.address,
          event_type: 1
        });
        storeService.setSourceLoading(<string>source.id, true);
      },
      onSourceSettingsSave() {
        showSettings.value = false;
      },
      onSourceDelete() {
        showSettings.value = false;
        storeService.setStreamCommandBar({ source: {id: selectedSourceId, address: selectedSourceAddress},
          action: StreamCommandBarActions.DeleteSource});
      },
      onOnvifClick(link: MenuLink) {
        selectedSourceAddress.value = <string>link.source?.address;
        showOnvif.value = true;
      }
    };
  },
  methods: {
    onLeftMenuClick(link: MenuLink) {
      //@ts-ignore
      this.activeLeftMenu = link.name;
      const me: any = this;
      console.log('MenuLayout says: active menu is ' + link.route);
      if (link.route) {
        if (link.route === 'add_source') {
          //@ts-ignore
          this.selectedSourceId = '';
          //@ts-ignore
          this.showSettings = true;
        } else {
          me.$store.commit('settings/setActiveLeftMenu', link);
          me.$router.push(link.route);
        }
      } else if (link.href) {
        window.open(link.href, '_blank');
      }
    }
  }
};
</script>

<style lang='sass'>
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%

  &__drawer-item
    line-height: 14px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>

<style scoped>
.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
  font-size: medium;
}

.my-menu-link {
  color: white;
  background: whitesmoke;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
