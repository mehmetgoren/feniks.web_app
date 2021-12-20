import { Module } from 'vuex';
import { IState } from '../index';
import state, { ISettingsState} from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const settings: Module<ISettingsState, IState> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};

export default settings;
