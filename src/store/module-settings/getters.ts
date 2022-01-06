import { GetterTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState, MenuLink, MenuObject } from './state';

const getters: GetterTree<ISettingsState, IState> = {
  dense(state : ISettingsState): boolean {
    return state.dense;
  },
  menu(state : ISettingsState): MenuObject {
    return state.menu;
  },
  activeTab(state : ISettingsState): string {
    return state.activeTab;
  },
  activeLeftMenu(state : ISettingsState): MenuLink | null {
    return state.activeLeftMenu;
  },
};

export default getters;
