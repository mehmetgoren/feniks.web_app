import { MutationTree } from 'vuex';
import { ISettingsState, MenuItem, MenuLink } from './state';

const mutation: MutationTree<ISettingsState> = {
  changeDense(state: ISettingsState, value: boolean) {
    state.dense = value;
  },

  addMenu(state: ISettingsState, obj: {name: string, menu: MenuItem}) {
    state.menu[obj.name] = obj.menu;
  },

  setActiveTab(state: ISettingsState, value: string) {
    state.activeTab = value;
  },

  setActiveLeftMenu(state: ISettingsState, value: MenuLink) {
    state.activeLeftMenu = value;
  },
};

export default mutation;
