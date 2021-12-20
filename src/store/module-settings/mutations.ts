import { MutationTree } from 'vuex';
import { ISettingsState } from './state';

const mutation: MutationTree<ISettingsState> = {
  changeDense (state: ISettingsState, value: boolean) {
    state.dense = value;
  }
};

export default mutation;
