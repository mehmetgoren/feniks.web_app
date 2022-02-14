import { EditorEvent } from 'src/utils/entities';
import { SourceModel } from 'src/utils/models/source_model';
import { api } from 'boot/axios';
import { BaseService } from 'src/utils/services/base-service';
import { WsConnection } from 'src/utils/ws/connection';

export class PublishService extends BaseService{
  public async publishStartStream(source: SourceModel): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/startstream`;
    await api.post(address, source);
  }

  public async publishStopStream(source: SourceModel): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/stopstream`;
    await api.post(address, source);
  }

  public async publishEditor(editorEvent: EditorEvent): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/editor`;
    await api.post(address, editorEvent);
  }

  // restart does not need to be subscribed to since it is only called by the restart_stream_request which is just a proxy.
  public async publishRestartStream(source: SourceModel){
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/restartstream`;
    await api.post(address, source);
  }
}

export class SubscribeService extends BaseService{
  public subscribeChat(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wschat', onMessage);
  }

  public subscribeStartStream(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstartstream', onMessage);
  }

  public subscribeStopStream(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsstopstream', onMessage);
  }

  public subscribeEditor(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wseditor', onMessage);
  }

  public subscribeFFmpegRead(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection('wsffmpegreader', onMessage);
  }
}
