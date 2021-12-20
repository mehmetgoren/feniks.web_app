import { store } from 'quasar/wrappers'
import { InjectionKey } from 'vue'
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from 'vuex'

import settings from './module-settings'
import { ISettingsState } from './module-settings/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface IState {
  // Define your own store structure, using submodules if needed
  settings: ISettingsState;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  // settings: unknown
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<IState>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<IState>> = Symbol('vuex-key')

export default store(function (/* { ssrContext } */) {
  const Store = createStore<IState>({
    modules: {
      settings
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: true//!!process.env.DEBUGGING
  })

  return Store;
})

export function useStore() {
  return vuexUseStore(storeKey)
}
