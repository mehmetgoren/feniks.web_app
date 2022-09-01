import { SourceModel } from 'src/utils/models/source_model';
import { IState, useStore } from 'src/store';
import { Store } from 'vuex';
import {MenuLink, StreamCommandBarInfo} from 'src/store/module-settings/state';
import { computed } from 'vue';
import { EditorImageResponseModel } from 'src/utils/entities';
import { User } from 'src/utils/models/user_model';

export class StoreService {
  private readonly $store: Store<IState> = useStore();

  public getNode() {
    return this.$store.getters['settings/menu']['node'];
  }

  public addSourceToLeftMenu(source: SourceModel) {
    const cameras = this.getCameras();
    let found = false;
    for (const camera of cameras) {
      if (camera.id == source.id) {
        found = true;
        break;
      }
    }
    if (!found) {
      this.$store.commit('settings/addSourceToLeftMenu', source);
    }
  }

  public updateSourceToLeftMenu(source: SourceModel) {
    this.$store.commit('settings/updateSourceToLeftMenu', source);
  }

  public removeSourceFromLeftMenu(sourceId: string) {
    this.$store.commit('settings/removeSourceFromLeftMenu', sourceId);
  }

  public getCameras(): MenuLink[] {
    return this.$store.getters['settings/cameras'];
  }

  public setSourceLoading(sourceId: string, loading: boolean) {
    this.$store.commit('settings/setSourceLoading', { id: sourceId, loading });
  }

  public get sourceLoading() {
    return computed(() => this.$store.getters['settings/sourceLoading']);
  }

  public get sourceStreamStatusChanged() {
    return computed(() => this.$store.getters['settings/sourceStreamStatusChanged']);
  }

  public setSourceThumbnail(responseModel: EditorImageResponseModel) {
    this.$store.commit('settings/setSourceThumbnail', {
      sourceId: responseModel.id,
      thumbnail: responseModel.image_base64
    });
  }

  public get currentUser() {
    return computed(() => this.$store.getters['settings/currentUser']);
  }

  public get aiSettingsSourceId() {
    return computed(() => this.$store.getters['settings/aiSettingsSourceId']);
  }

  public setCurrentUser(user: User | null) {
    this.$store.commit('settings/currentUser', user);
  }

  public setAiSettingsSourceId(sourceId: string) {
    this.$store.commit('settings/aiSettingsSourceId', sourceId);
  }

  public setNotifySourceStreamStatusChanged() {
    this.$store.commit('settings/notifySourceStreamStatusChanged');
  }

  public get clickedStreamCommandBar() {
    return computed(() => this.$store.getters['settings/clickedStreamCommandBar']);
  }

  public setStreamCommandBar(info: StreamCommandBarInfo) {
    this.$store.commit('settings/streamCommandbarClicked', info);
  }
}
