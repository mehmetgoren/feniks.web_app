import { MutationTree } from 'vuex';
import {ISettingsState, LoadingInfo, MenuItem, MenuLink, StreamCommandBarInfo} from './state';
import { List } from 'linqts';
import { SourceModel } from 'src/utils/models/source_model';
import { LocalService } from 'src/utils/services/local_service';
import { User } from 'src/utils/models/user_model';

const mutation: MutationTree<ISettingsState> = {
  changeDense(state: ISettingsState, value: boolean) {
    state.dense = value;
  },
  addMenu(state: ISettingsState, obj: { name: string, menu: MenuItem }) {
    state.menu[obj.name] = obj.menu;
  },
  setSourceThumbnail(state: ISettingsState, obj: { sourceId: string, thumbnail: string }) {
    const key = 'node';
    const menu = state.menu[key];
    if (!menu)
      return;
    const sources = state.menu[key]['cameras'];
    const source = new List<MenuLink>(<any>sources).FirstOrDefault(x => x?.id === obj.sourceId);
    if (source) {
      source.thumbnail = obj.thumbnail;
    }
  },
  setActiveLeftMenu(state: ISettingsState, value: MenuLink) {
    state.activeLeftMenu = value;
  },
  setSourceLoading(state: ISettingsState, value: LoadingInfo) {
    state.sourceLoading = value;
  },
  addSourceToLeftMenu(state: ISettingsState, source: SourceModel){
    const route = 'node';
    const menuLink: MenuLink = {
      route: route + '&source=' + source.id,
      icon: source.enabled ? 'videocam' :  'videocam_off',
      text: source.name,
      id: source.id,
      source: source,
      isSource: true,
      thumbnail: null
    };
    state.menu['node']['cameras'].push(menuLink);
  },
  updateSourceToLeftMenu(state: ISettingsState, source: SourceModel){
    const cameras = [...state.menu['node']['cameras']];
    for (let j = 0; j < cameras.length; ++j){
      const cam = cameras[j];
      if (cam.id === source.id){
        cam.text = source.name;
        cam.source = source;
        cam.icon = source.enabled ? 'videocam' :  'videocam_off';
        break;
      }
    }
  },
  removeSourceFromLeftMenu(state: ISettingsState, sourceId: string){
    const cameras = [...state.menu['node']['cameras']];
    state.menu['node']['cameras'] = cameras.filter(x => x.id != sourceId);
  },
  notifySourceStreamStatusChanged(state: ISettingsState){
    state.sourceStreamStatusChanged = !state.sourceStreamStatusChanged;
  },
  aiSettingsSourceId(state: ISettingsState, sourceId: string){
    state.aiSettingsSourceId = sourceId;
  },
  recordSourceId(state: ISettingsState, sourceId: string){
    state.recordSourceId = sourceId;
  },
  currentUser(state: ISettingsState, user: User){
    state.currentUser = user;
    new LocalService().setCurrentUser(user);
  },
  streamCommandbarClicked(state: ISettingsState, info: StreamCommandBarInfo){
    state.clickedStreamCommandBar = info;
  },
  set18n(state: ISettingsState, t: any){
    const n = state.menu.node;
    n['config'][0].text = t('config');
    n['stream_gallery'][0].text = t('stream_gallery');
    n['add_source'][0].text = t('add_source');
    n['fr_training'][0].text = t('fr_training');
    n['ai_data'][0].text = t('ai_data');
  }
};

export default mutation;
