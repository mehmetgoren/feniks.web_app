import { GetterTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState } from './state';

const getters: GetterTree<ISettingsState, IState> = {
  dense (state : ISettingsState) {
    return state.dense;
  }
};

export default getters;
