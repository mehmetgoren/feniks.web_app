import { ActionTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState } from './state';

const actions: ActionTree<ISettingsState, IState> = {
  someAction (/* context */) {
    // your code
  }
};

export default actions;
