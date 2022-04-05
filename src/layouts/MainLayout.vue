<template>
  <q-layout view='hHh lpR fFf' class='bg-grey-1'>
    <q-header elevated class='bg-white text-grey-8' height-hint='64'>
      <q-toolbar class='GNL__toolbar'>
        <q-btn flat dense round @click='toggleLeftDrawer' aria-label='Menu' icon='menu' class='q-mr-sm' />

        <q-toolbar-title v-if='$q.screen.gt.xs' shrink class='row items-center no-wrap'>
          <img src='../../public/icons/logo-xs.png' alt='logo'>
          <span class='q-ml-sm'></span>
        </q-toolbar-title>

        <q-space />
        <!--search panel-->
        <q-input class='GNL__toolbar-input' outlined dense v-model='search' color='bg-grey-7 shadow-1'
                 placeholder='Search for topics, locations & sources'>
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name='search' />
            <q-icon v-else name='clear' class='cursor-pointer' @click="search = ''" />
          </template>
          <template v-slot:append>
            <q-btn
              flats
              dense
              round
              aria-label='Menu'
              icon='arrow_drop_down'
            >
              <q-menu anchor='bottom end' self='top end'>
                <div class='q-pa-md' style='width: 400px'>
                  <div class='text-body2 text-grey q-mb-md'>
                    Narrow your search results
                  </div>

                  <div class='row items-center'>
                    <div class='col-3 text-subtitle2 text-grey'>
                      Exact phrase
                    </div>
                    <div class='col-9 q-pl-md'>
                      <q-input dense v-model='exactPhrase' />
                    </div>

                    <div class='col-3 text-subtitle2 text-grey'>
                      Has words
                    </div>
                    <div class='col-9 q-pl-md'>
                      <q-input dense v-model='hasWords' />
                    </div>

                    <div class='col-3 text-subtitle2 text-grey'>
                      Exclude words
                    </div>
                    <div class='col-9 q-pl-md'>
                      <q-input dense v-model='excludeWords' />
                    </div>

                    <div class='col-3 text-subtitle2 text-grey'>
                      Website
                    </div>
                    <div class='col-9 q-pl-md'>
                      <q-input dense v-model='byWebsite' />
                    </div>

                    <div class='col-12 q-pt-lg row justify-end'>
                      <q-btn flat dense no-caps color='grey-7' size='md' style='min-width: 68px;' label='Search'
                             v-close-popup />
                      <q-btn flat dense no-caps color='grey-7' size='md' style='min-width: 68px;' @click='onClear'
                             label='Clear' v-close-popup />
                    </div>
                  </div>
                </div>
              </q-menu>
            </q-btn>
          </template>
        </q-input>

        <q-space />
        <!--  left panel panel-->
        <div class='q-gutter-sm row items-center no-wrap'>
          <q-btn v-if='$q.screen.gt.sm' round dense flat color='text-grey-7' icon='apps'>
            <q-tooltip>Google Apps</q-tooltip>
          </q-btn>
          <q-btn round dense flat color='grey-8' icon='notifications'>
            <q-badge color='red' text-color='white' floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size='26px'>
              <img src='https://cdn.quasar.dev/img/boy-avatar.png' alt='avatar'>
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
      <!--Node will sit here-->
      <q-tabs v-model='tab' align='left' v-if='tabs'>
        <q-tab label='Home' key='home' name='home' id='home' @click='onTabClick(homeNode)' />
        <q-tab v-for='tab in tabs' :key='tab.node_address' :label='tab.name' :name='tab.node_address' @click='onTabClick(tab)' />
      </q-tabs>
    </q-header>

    <q-drawer v-model='leftDrawerOpen' show-if-above bordered class='bg-white' :width='280'>
      <q-scroll-area class='fit'>
        <q-list padding class='text-grey-8'>
          <div v-for='(menu, index) in menus' :key='index'>
            <q-item v-for='link in menu' :key='link.text' class='GNL__drawer-item'>
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
                    <q-icon v-if='sourceStreamStatus[link.id].streaming' name='live_tv' color='green' style='margin-right: 3px;' class='blink_me'/>
                    <q-icon v-if='sourceStreamStatus[link.id].recording' name='fiber_manual_record' color='red' style='margin-right: 3px;' class='blink_me'/>
                    <q-icon :name='link.icon' />
                    {{ link.text }}
                  </div>
                  <q-inner-loading v-if='loadingObject[link.id]' :showing='true' label='Please wait...' label-class='text-cyan'
                                   label-style='font-size: 1.1em' />
                </q-img>
              </q-item-section>
              <q-btn-dropdown v-if='link.isSource' color='primary' dropdown-icon='settings' :dense='true'>
                <q-list>
                  <q-item clickable v-close-popup @click='onSaveSettingsClicked(link.id)' v-ripple>
                    <q-item-section side>
                      <q-icon name='settings' color='cyan' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Settings</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onStartStreaming(link)' v-ripple>
                    <q-item-section side>
                      <q-icon name='live_tv' color='cyan' />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Start Streaming</q-item-label>
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
                <q-inner-loading v-if='loadingObject[link.id]' :showing='true'>
                  <q-spinner-gears size="50px" color="primary" />
                </q-inner-loading>
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
    <SourceSettings :source-id='selectedSourceId' @on-save='onSourceSettingsSave' />
  </q-dialog>

  <q-dialog v-model='showRecords' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceRecords :source-id='selectedSourceId' />
  </q-dialog>

</template>

<script lang='ts'>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { useRouter, useRoute } from 'vue-router';
import { NodeRepository } from 'src/utils/db';
import { NodeService } from 'src/utils/services/node_service';
import { MenuItem, MenuLink, LoadingInfo } from 'src/store/module-settings/state';
import { PublishService, SubscribeService } from 'src/utils/services/websocket_services';
import { EditorImageResponseModel, Node } from 'src/utils/entities';
import SourceSettings from 'components/SourceSettings.vue';
import SourceRecords from 'components/SourceRecords.vue';
import { SourceModel } from 'src/utils/models/source_model';
import { createEmptyBase64Image, startStream } from 'src/utils/utils';

export default {
  name: 'Ionix Layout',
  components: {
    SourceSettings,
    SourceRecords
  },
  setup() {
    const homeNode: Node = { node_address: '', name: 'home', description: '', enabled: true };
    const tab = ref<string>('home');
    const router = useRouter();
    const route = useRoute();
    const path = computed(() => route.path);
    const $store = useStore();
    const leftDrawerOpen = ref(false);
    const search = ref('');
    const showAdvanced = ref(false);
    const showDateOptions = ref(false);
    const exactPhrase = ref('');
    const hasWords = ref('');
    const excludeWords = ref('');
    const byWebsite = ref('');
    const byDate = ref('Any time');
    const nodeRep = ref(new NodeRepository());
    const nodeService = new NodeService();
    const publishService = new PublishService();
    const subscribeService = new SubscribeService();
    const loadingObject = reactive<any>({});
    const sourceStreamStatus = reactive<any>({});
    const showSettings = ref<boolean>(false);
    const showRecords = ref<boolean>(false);
    const selectedSourceId = ref<string>('');
    const emptyBase64Image = ref<string>(createEmptyBase64Image());

    const tabs = ref();
    onMounted(async () => {
      tabs.value = await nodeRep.value.getAll();

      subscribeService.subscribeEditor((event: MessageEvent) => {
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        if (responseModel.event_type != 2) {
          return;
        }
        $store.commit('settings/setSourceThumbnail', {
          sourceId: responseModel.id,
          thumbnail: responseModel.image_base64
        });
      });
    });
    const getPureMenuPath = () => {
      let path_str: any = path.value;
      path_str = path_str.split('-')[0];
      path_str = path_str.replace('/', '');
      return path_str;
    };
    const menus = ref($store.getters['settings/menu'][getPureMenuPath()]);

    const onTabClick = async (tab: Node) => {
      $store.commit('settings/setActiveTab', tab);
      const menu = $store.getters['settings/menu'];
      if (tab.name === 'home') {
        menus.value = menu[''];
        await router.push('home');
        return;
      }
      const route = 'node?n=' + tab.node_address;
      if (!menu[route]) {
        const sources = await nodeService.getSourceList();
        const menuLinks: MenuLink[] = [];
        for (const source of sources) {
          getThumbnail(source);
          const menuLink: MenuLink = {
            route: route + '&source=' + source.id,
            icon: 'videocam',
            text: source.name,
            id: source.id,
            source: source,
            isSource: true,
            thumbnail: null
          };
          loadingObject[<string>menuLink.id] = false;
          menuLinks.push(menuLink);
        }
        await sourceStreamDatabind();
        const menuObject: MenuItem = {};
        menuObject['config'] = [
          {
            route: route + '&x=config',
            icon: 'settings',
            text: 'Configuration'
          }
        ];
        menuObject['stream_gallery'] = [
          {
            route: route + '&x=gallery',
            icon: 'grid_on',
            text: 'Stream Gallery'
          }
        ];
        menuObject['add_source'] = [
          {
            route: route + '&x=add_source',
            icon: 'add_box',
            text: 'Add Source'
          }
        ];
        menuObject['cameras'] = menuLinks;

        $store.commit('settings/addMenu', {
          name: route,
          menu: menuObject
        });
      }
      menus.value = menu[route];
      await router.push('node?n=' + tab.node_address);
    };

    async function sourceStreamDatabind(){
      const sourceStreamStatusList = await nodeService.getSourceStreamStatus();
      for (const item of sourceStreamStatusList){
        sourceStreamStatus[item.id] = item;
      }
    }

    const sourceLoading = computed(() => $store.getters['settings/sourceLoading']);
    watch(sourceLoading, (obj: LoadingInfo) => {
      loadingObject[obj.id] = obj.loading;
    });

    const sourceStreamStatusChanged = computed(() => $store.getters['settings/sourceStreamStatusChanged']);
    watch(sourceStreamStatusChanged, async () => {
      await sourceStreamDatabind();
    });

    function onClear() {
      exactPhrase.value = '';
      hasWords.value = '';
      excludeWords.value = '';
      byWebsite.value = '';
      byDate.value = 'Any time';
    }

    function changeDate(option: any) {
      byDate.value = option;
      showDateOptions.value = false;
    }

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function getThumbnail(source: SourceModel){
      publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        address: source.address,
        event_type: 2
      }).then().catch(console.error);
      console.log('publishService called');
    }

    return {
      homeNode,
      tab,
      leftDrawerOpen,
      search,
      showAdvanced,
      showDateOptions,
      exactPhrase,
      hasWords,
      excludeWords,
      byWebsite,
      byDate,
      menus,
      onClear,
      changeDate,
      toggleLeftDrawer,
      tabs,
      onTabClick,
      loadingObject,
      sourceStreamStatus,
      showSettings,
      selectedSourceId,
      showRecords,
      onSaveSettingsClicked(sourceId: string) {
        showSettings.value = true;
        selectedSourceId.value = sourceId;
      },
      onStartStreaming(link: MenuLink){
        startStream($store, publishService, <SourceModel>link.source);
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
      },
      onSourceSettingsSave(){
        showSettings.value = false;
      },
      getThumbnail,
      emptyBase64Image
    };
  },
  methods: {
    onLeftMenuClick(link: MenuLink) {
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
    line-height: 24px
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
  color:red;
  font-size:medium;
}

@keyframes blinker {
  50% { opacity: 0; }
}
</style>
