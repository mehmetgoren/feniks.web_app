<template>
  <q-layout view='hHh lpR fFf' class='bg-grey-1'>
    <q-header elevated class='bg-white text-grey-8'>
      <q-toolbar class='GNL__toolbar'>
        <q-btn flat dense round @click='toggleLeftDrawer' aria-label='Menu' icon='menu' class='q-mr-sm' />

        <q-toolbar-title v-if='$q.screen.gt.xs' shrink class='row items-center no-wrap'>
          <img src='../../public/icons/logo.png' width='60' alt='logo'>
        </q-toolbar-title>
        <ServerStatsBar />
        <q-space />
        <!--  left panel panel-->
        <div class='q-gutter-sm row items-center no-wrap'>
          <q-btn-dropdown icon='account_circle' round flat :label='currentUser?.username'>
            <q-list>
              <q-item clickable v-close-popup @click='onLogoutUser'>
                <q-item-section>
                  <q-item-label>
                    <q-avatar size='36px'>
                      <q-icon name='logout' />
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
                <q-icon v-if='!link.isSource' :name='link.icon' />
              </q-item-section>
              <q-item-section v-if='!link.isSource' style='cursor: pointer;' v-ripple @click='onLeftMenuClick(link)'>
                <q-item-label>{{ link.text }}</q-item-label>
              </q-item-section>
              <q-item-section v-if='link.isSource'>
                <q-img :src="'data:image/png;base64, ' + (link.thumbnail ? link.thumbnail : emptyBase64Image)" spinner-color='white'
                       style='height: 80px; width: 200px; cursor: pointer;' class='rounded-borders'>
                  <div class='absolute-bottom text-subtitle1'>
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].streaming' name='live_tv' color='green' style='margin-right: 3px;'
                            class='blink_me' />
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].recording' name='fiber_manual_record' color='red'
                            style='margin-right: 3px;' class='blink_me' />
                    <q-icon :name='link.icon' />
                    {{ link.text }}
                  </div>
                  <q-inner-loading v-if='loadingObject[link.id]' :showing='true' label='Please wait...' label-class='text-cyan'
                                   label-style='font-size: 1.1em'>
                    <q-spinner-hourglass size='75%' color='cyan' />
                  </q-inner-loading>
                </q-img>
              </q-item-section>
              <q-btn-dropdown v-if='link.isSource' color='primary' dropdown-icon='settings' :dense='true'>
                <q-list>
                  <q-item clickable v-close-popup @click='onStartStreaming(link)' v-ripple>
                    <q-item-section side>
                      <q-icon name='live_tv' color='cyan' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Start Streaming</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onSaveSettingsClicked(link.id)' v-ripple>
                    <q-item-section side>
                      <q-icon name='settings' color='cyan' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Settings</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onShowRecordClicked(link.id)'>
                    <q-item-section side>
                      <q-icon name='dvr' color='purple' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Playback</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onAiClick(link.id)'>
                    <q-item-section side>
                      <q-icon name='psychology' color='orange' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>AI</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onOnvifClick(link)'>
                    <q-item-section side>
                      <q-icon name='settings_ethernet' color='brown-5' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>ONVIF</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onTakeScreenshotClicked(link)'>
                    <q-item-section side>
                      <q-icon name='photo_camera' color='purple' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Take a screenshot</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-item clickable v-close-popup @click='getThumbnail(link.source)'>
                  <q-item-section side>
                    <q-icon name='center_focus_strong' color='purple' />
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
            <q-separator v-if='menu.length' inset class='q-my-sm' />
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :source-id='selectedSourceId' @on-save='onSourceSettingsSave' @on-delete='onSourceDelete' />
  </q-dialog>

  <q-dialog v-model='showRecords' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecords :source-id='selectedSourceId' />
  </q-dialog>

  <q-dialog v-model='showOnvif' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <OnvifSettings :address='selectedSourceAddress' :color='"brown-5"' />
  </q-dialog>

</template>

<script lang='ts'>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NodeService } from 'src/utils/services/node_service';
import { MenuLink, LoadingInfo } from 'src/store/module-settings/state';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { EditorImageResponseModel } from 'src/utils/entities';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecords from 'components/SourceRecords.vue';
import OnvifSettings from 'components/OnvifSettings.vue';
import ServerStatsBar from 'components/ServerStatsBar.vue';
import { SourceModel } from 'src/utils/models/source_model';
import { createEmptyBase64Image, startStream } from 'src/utils/utils';
import { StoreService } from 'src/utils/services/store_service';

export default {
  name: 'Ionix Layout',
  components: {
    SourceSettings, SourceRecords, OnvifSettings, ServerStatsBar
  },
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const nodeService = new NodeService();
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

    const loadSources = async () => {
      const sources = await nodeService.getSourceList();
      for (const source of sources) {
        storeService.addSourceToLeftMenu(source);
        setTimeout(() => {
          getThumbnail(source);
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

    onMounted(async () => {
      const nodeIp = await nodeService.LocalService.getNodeIP();
      const subscribeService = new SubscribeService(nodeIp);

      subscribeService.subscribeEditor('ml', (event: MessageEvent) => {
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        if (responseModel.event_type == 2) {
          storeService.setSourceThumbnail(responseModel);
        }
        storeService.setSourceLoading(<string>responseModel.id, false);
      });
      await loadSources();
      await sourceStreamDatabind();
    });

    const currentUser = storeService.currentUser;

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function getThumbnail(source: SourceModel) {
      publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        address: source.address,
        event_type: 2
      }).then().catch(console.error);
      storeService.setSourceLoading(<string>source.id, true);
    }

    const onAiClick = (sourceId: string) => {
      storeService.setAiSettingsClicked();
      storeService.setAiSettingsSourceId(sourceId);
      const route = 'node?x=ai';
      void router.push(route);
    };

    const onLogoutUser = async () => {
      await nodeService.logoutUser(currentUser.value);
      nodeService.LocalService.setCurrentUser(null);
      storeService.setCurrentUser(null);
      await router.push('/');
      window.location.reload();
    };

    return {
      leftDrawerOpen, menus, currentUser,
      loadingObject, sourceStreamStatus, showSettings, selectedSourceId, showRecords, emptyBase64Image, activeLeftMenu, selectedSourceAddress, showOnvif,
      toggleLeftDrawer, getThumbnail, onAiClick, onLogoutUser,
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
      onOnvifClick(link: MenuLink) {
        selectedSourceAddress.value = <string>link.source?.address;
        showOnvif.value = true;
      },
      onSourceDelete() {
        showSettings.value = false;
      }
    };
  },
  methods: {
    onLeftMenuClick(link: MenuLink) {
      //@ts-ignore
      this.activeLeftMenu = link.name;
      const me: any = this;
      // if (link.route === 'node') {
      //   me.$router.push('node-' +  link.route);
      // }
      if (link.route) {
        console.log('MenuLayout says: active menu is ' + link.route);
        me.$store.commit('settings/setActiveLeftMenu', link);
        me.$router.push(link.route);
        if (link.text === 'Add Source') {
          me.$store.commit('settings/addSourceClicked');
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
