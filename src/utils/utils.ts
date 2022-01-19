import { IState } from 'src/store';
import { PublishService } from 'src/utils/services/websocket-services';
import { Store } from 'vuex';
import { Source } from 'src/utils/entities';

export const NodeMngrPort = '2072';
export const NodeMngrAddress = 'localhost:' + NodeMngrPort;
export const IonixHubAddress = 'localhost:7242';

export function parseQs(qs = window.location.search) {
  const urlSearchParams = new URLSearchParams(qs);
  const params = Object.fromEntries(urlSearchParams.entries());
  return params;
}

export function startStreaming($store: Store<IState>, publishService: PublishService, source: Source) {
  $store.commit('settings/setSourceLoading', true);
  // todo: localhost should be replaced with real node ip
  publishService.publishStartStreaming('localhost', source).then(() => {
    console.log('streaming request has been started');
  }).catch((err) => {
    console.log('streaming request had an error: ' + err);
  });
}
