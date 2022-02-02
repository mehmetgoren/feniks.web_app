import { GetterTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState, LoadingInfo, MenuLink, MenuObject } from './state';
import { Node } from 'src/utils/entities';

const getters: GetterTree<ISettingsState, IState> = {
  dense(state : ISettingsState): boolean {
    return state.dense;
  },
  menu(state : ISettingsState): MenuObject {
    return state.menu;
  },
  activeTab(state : ISettingsState): Node {
    return state.activeTab;
  },
  activeLeftMenu(state : ISettingsState): MenuLink | null {
    return state.activeLeftMenu;
  },
  sourceLoading(state : ISettingsState): LoadingInfo {
    return state.sourceLoading;
  },
  addSourceClicked(state: ISettingsState): boolean{
    return state.addSourceClicked;
  }
};

export default getters;
