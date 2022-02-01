import { EditorEvent } from 'src/utils/entities';
import { SourceModel } from 'src/utils/models/source_model';
import { api } from 'boot/axios';
import { BaseService } from 'src/utils/services/base-service';
import { WsConnection } from 'src/utils/ws/connection';

export class PublishService extends BaseService{
  public async publishStartStreaming(source: SourceModel): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/startstreaming`;
    await api.post(address, source);
  }

  public async publishStopStreaming(source: SourceModel): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/stopstreaming`;
    await api.post(address, source);
  }

  public async publishEditor(editorEvent: EditorEvent): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/editor`;
    await api.post(address, editorEvent);
  }

  // restart does not need to be subscribed to since it is only called by the restart_streaming_request which is just a proxy.
  public async publishRestartStreaming(source: SourceModel){
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/restartstreaming`;
    await api.post(address, source);
  }
}

export class SubscribeService extends BaseService{
  public subscribeChat(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wschat', onMessage);
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
