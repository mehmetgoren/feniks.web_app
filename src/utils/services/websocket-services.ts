import { EditorEvent, Source } from 'src/utils/entities';
import { api } from 'boot/axios';
import { BaseService } from 'src/utils/services/base-service';
import { WsConnection } from 'src/utils/ws/connection';

export class PublishService extends BaseService{
  public async publishStartRecording(nodeAddress: string, source: Source): Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/startrecording';
    await api.post(address, source);
  }

  public async publishStopRecording(nodeAddress: string, source: Source): Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/stoprecording';
    await api.post(address, source);
  }

  public async publishStartStreaming(nodeAddress: string, source: Source): Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/startstreaming';
    await api.post(address, source);
  }

  public async publishStopStreaming(nodeAddress: string, source: Source): Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/stopstreaming';
    await api.post(address, source);
  }

  public async publishEditor(nodeAddress: string, editorEvent: EditorEvent): Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/editor';
    await api.post(address, editorEvent);
  }
}

export class SubscribeService extends BaseService{
  public subscribeChat(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wschat', onMessage);
  }

  public subscribeStartRecording(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstartrecording', onMessage);
  }

  public subscribeStopRecording(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstoprecording', onMessage);
  }

  public subscribeStartStreaming(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstartstreaming', onMessage);
  }

  public subscribeStopStreaming(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstopstreaming', onMessage);
  }

  public subscribeEditor(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wseditor', onMessage);
  }
}
