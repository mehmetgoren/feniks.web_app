import { MutationTree } from 'vuex';
import { ISettingsState, LoadingInfo, MenuItem, MenuLink } from './state';
import { List } from 'linqts';
import { Node } from 'src/utils/entities';
import { SourceModel } from 'src/utils/models/source_model';
import { LocalService } from 'src/utils/services/local_service';

const mutation: MutationTree<ISettingsState> = {
  changeDense(state: ISettingsState, value: boolean) {
    state.dense = value;
  },
  addMenu(state: ISettingsState, obj: { name: string, menu: MenuItem }) {
    state.menu[obj.name] = obj.menu;
  },
  setSourceThumbnail(state: ISettingsState, obj: { sourceId: string, thumbnail: string }) {
    const key = 'node?n=' + state.activeTab.node_address;
    const menu = state.menu[key];
    if (!menu)
      return;
    const sources = state.menu[key]['cameras'];
    const source = new List<MenuLink>(<any>sources).FirstOrDefault(x => x?.id === obj.sourceId);
    if (source) {
      source.thumbnail = obj.thumbnail;
    }
  },
  setActiveTab(state: ISettingsState, value: Node) {
    state.activeTab = value;
    new LocalService().setActiveTab(value);
  },
  setActiveLeftMenu(state: ISettingsState, value: MenuLink) {
    state.activeLeftMenu = value;
  },
  setSourceLoading(state: ISettingsState, value: LoadingInfo) {
    state.sourceLoading = value;
  },
  addSourceToLeftMenu(state: ISettingsState, source: SourceModel){
    const route = 'node?n=' + source.address;
    const menuLink: MenuLink = {
      route: route + '&source=' + source.id,
      icon: 'videocam',
      text: source.name,
      id: source.id,
      source: source,
      isSource: true,
      thumbnail: null
    };
    state.menu['node?n=' + state.activeTab.node_address]['cameras'].push(menuLink);
  },
  updateSourceToLeftMenu(state: ISettingsState, source: SourceModel){
    const cameras = [...state.menu['node?n=' + state.activeTab.node_address]['cameras']];
    for (let j = 0; j < cameras.length; ++j){
      if (cameras[j].id === source.id){
        cameras[j].text = source.name;
        cameras[j].source = source;
        break;
      }
    }
  },
  removeSourceFromLeftMenu(state: ISettingsState, sourceId: string){
    const cameras = [...state.menu['node?n=' + state.activeTab.node_address]['cameras']];
    state.menu['node?n=' + state.activeTab.node_address]['cameras'] = cameras.filter(x => x.id != sourceId);
  },
  addSourceClicked(state: ISettingsState){
    state.addSourceClicked = !state.addSourceClicked;
  },
  notifySourceStreamStatusChanged(state: ISettingsState){
    state.sourceStreamStatusChanged = !state.sourceStreamStatusChanged;
  }
};

export default mutation;
