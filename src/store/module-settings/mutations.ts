import { MutationTree } from 'vuex';
import { ISettingsState, MenuItem, MenuLink } from './state';
import { List } from 'linqts';
import { Node } from 'src/utils/entities';

const mutation: MutationTree<ISettingsState> = {
  changeDense(state: ISettingsState, value: boolean) {
    state.dense = value;
  },
  addMenu(state: ISettingsState, obj: { name: string, menu: MenuItem }) {
    state.menu[obj.name] = obj.menu;
  },
  setSourceThumbnail(state: ISettingsState, obj: { sourceId: string, thumbnail: string }) {
    const key = 'node?n=' + state.activeTab.node_address;
    const sources = state.menu[key]['cameras'];
    const source = new List<MenuLink>(<any>sources).FirstOrDefault(x => x?.id === obj.sourceId);
    if (source) {
      source.thumbnail = obj.thumbnail;
    }
  },
  setActiveTab(state: ISettingsState, value: Node) {
    state.activeTab = value;
  },
  setActiveLeftMenu(state: ISettingsState, value: MenuLink) {
    state.activeLeftMenu = value;
  },
  setSourceLoading(state: ISettingsState, value: boolean) {
    state.sourceLoading = value;
  }
};

export default mutation;
