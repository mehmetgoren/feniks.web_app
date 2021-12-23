import { MutationTree } from 'vuex';
import { ISettingsState, MenuItem } from './state';

const mutation: MutationTree<ISettingsState> = {
  changeDense (state: ISettingsState, value: boolean) {
    state.dense = value;
  },

  addMenu (state: ISettingsState, obj: {name: string, menu: MenuItem}) {
    state.menu[obj.name] = obj.menu;
  },

};

export default mutation;
