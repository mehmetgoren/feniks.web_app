import { api } from 'boot/axios';
import {EditorEvent} from 'src/utils/entities';
import {SourceModel} from 'src/utils/models/source_model';
import {BaseService} from 'src/utils/services/base_service';
import {WsConnection} from 'src/utils/ws/connection';
import {VideMergeRequestEvent} from 'src/utils/models/video_merge';
import {ProbeRequestEvent} from 'src/utils/models/various';

export class PublishService extends BaseService {
  constructor() {
    super();
  }

  private getPublishEndpointRoot(route: string): string {
    return this.LocalService.getServerAddress(route)
  }

  public async publishStartStream(source: SourceModel): Promise<void> {
    const address = this.getPublishEndpointRoot('startstream');
    await api.post(address, source);
  }

  public async publishStopStream(source: SourceModel): Promise<void> {
    const address = this.getPublishEndpointRoot('stopstream');
    await api.post(address, source);
  }

  public async publishEditor(editorEvent: EditorEvent): Promise<void> {
    const address = this.getPublishEndpointRoot('editor');
    await api.post(address, editorEvent);
  }

  // restart does not need to be subscribed to since it is only called by the restart_stream_request which is just a proxy.
  public async publishRestartStream(source: SourceModel) {
    const address = this.getPublishEndpointRoot('restartstream');
    await api.post(address, source);
  }


  public async publishVideoMerge(event: VideMergeRequestEvent) {
    const address = this.getPublishEndpointRoot('videomerge');
    await api.post(address, event);
  }

  public async publishFaceTrain(): Promise<void> {
    const address = this.getPublishEndpointRoot('facetrain');
    await api.post(address, {});
  }

  public async publishProbe(rtspAddress: string): Promise<void> {
    const address = this.getPublishEndpointRoot('probe');
    const params: ProbeRequestEvent = {address: rtspAddress};
    await api.post(address, params);
  }
}

export class SubscribeService extends BaseService {
  private readonly serverIp: string;
  private readonly serverPort: number;

  constructor() {
    super();
    this.serverIp = this.LocalService.getServerIp();
    this.serverPort = this.LocalService.getServerPort();
  }

  private setAuth(route: string, extendedQs: string | null) {
    const token = this.getUserToken();
    if (token) {
      route += `?token=${token}${(extendedQs ? '&' + extendedQs : '')}`;
    } else if (extendedQs) {
      route += `?${extendedQs}`;
    }
    return route;
  }

  public subscribeStartStream(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsstartstream', null), onMessage);
  }

  public subscribeStopStream(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsstopstream', null), onMessage);
  }

  public subscribeEditor(requester: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wseditor', `requester=${requester}`), onMessage);
  }

  public subscribeFFmpegRead(sourceId: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsffmpegreader', `id=${sourceId}`), onMessage);
  }

  public subscribeVideomerge(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsvideomerge', null), onMessage);
  }

  public subscribeFaceTrain(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsfacetrain', null), onMessage);
  }

  public subscribeProbe(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsprobe', null), onMessage);
  }

  public subscribeNotifier(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsnotifier', null), onMessage);
  }

  public subscribeUserLogout(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.serverIp, this.serverPort, this.setAuth('wsuserlogout', null), onMessage);
  }
}
