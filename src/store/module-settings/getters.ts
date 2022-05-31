import { GetterTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState, LoadingInfo, MenuLink, MenuObject } from './state';
import { Node } from 'src/utils/entities';
import { User } from 'src/utils/models/user_model';

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
  },
  sourceStreamStatusChanged(state: ISettingsState): boolean{
    return state.sourceStreamStatusChanged;
  },
  aiSettingsClicked(state: ISettingsState): boolean{
    return state.aiSettingsClicked;
  },
  aiSettingsSourceId(state: ISettingsState): string{
    return state.aiSettingsSourceId;
  },
  currentUser(state: ISettingsState): User | null{
    return state.currentUser;
  }
};

export default getters;
