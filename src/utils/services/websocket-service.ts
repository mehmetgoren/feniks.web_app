import { Source } from 'src/utils/entities';
import { api } from 'boot/axios';
import { BaseService } from 'src/utils/services/base-service';
import { WsConnection } from 'src/utils/ws/connection';

export class WebsocketService extends BaseService{
  public async startRecording(nodeAddress: string, source: Source):Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/startrecording';
    await api.post(address, source);
  }

  public async stopRecording(nodeAddress: string, source: Source):Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/stoprecording';
    await api.post(address, source);
  }

  public async startStreaming(nodeAddress: string, source: Source):Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/startstreaming';
    await api.post(address, source);
  }

  public async stopStreaming(nodeAddress: string, source: Source):Promise<void> {
    const address = 'http://' + nodeAddress + ':' + this._defaultPort + '/stopstreaming';
    await api.post(address, source);
  }

  public openChatConnection(onMessage: ((this: WebSocket, ev: MessageEvent) => any)) : WsConnection{
     return new WsConnection('wschat', onMessage);
  }

  public openStartRecordingConnection(onMessage: ((this: WebSocket, ev: MessageEvent) => any)) : WsConnection{
    return new WsConnection('wsstartrecording', onMessage);
  }

  public openStopRecordingConnection(onMessage: ((this: WebSocket, ev: MessageEvent) => any)) : WsConnection{
    return new WsConnection('wsstoprecording', onMessage);
  }

  public openStartStreamingConnection(onMessage: ((this: WebSocket, ev: MessageEvent) => any)) : WsConnection{
    return new WsConnection('wsstartstreaming', onMessage);
  }

  public openStopStreamingConnection(onMessage: ((this: WebSocket, ev: MessageEvent) => any)) : WsConnection{
    return new WsConnection('wsstopstreaming', onMessage);
  }
}
