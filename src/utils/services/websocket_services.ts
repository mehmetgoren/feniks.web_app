import {EditorEvent} from 'src/utils/entities';
import {SourceModel} from 'src/utils/models/source_model';
import {api} from 'boot/axios';
import {BaseService} from 'src/utils/services/base_service';
import {WsConnection} from 'src/utils/ws/connection';
import {OnvifEvent, OnvifAction, OnvifParams} from 'src/utils/models/onvif_models';
import {VideMergeRequestEvent} from 'src/utils/models/video_merge';
import {ProbeRequestEvent} from 'src/utils/models/various';

export class PublishService extends BaseService {
  constructor() {
    super();
  }

  private async getPublishEndpointRoot(): Promise<string> {
    return await this.LocalService.getNodeAddress('')
  }

  public async publishStartStream(source: SourceModel): Promise<void> {
    const address = `${await this.getPublishEndpointRoot()}/startstream`;
    await api.post(address, source);
  }

  public async publishStopStream(source: SourceModel): Promise<void> {
    const address = `${await this.getPublishEndpointRoot()}/stopstream`;
    await api.post(address, source);
  }

  public async publishEditor(editorEvent: EditorEvent): Promise<void> {
    const address = `${await this.getPublishEndpointRoot()}/editor`;
    await api.post(address, editorEvent);
  }

  // restart does not need to be subscribed to since it is only called by the restart_stream_request which is just a proxy.
  public async publishRestartStream(source: SourceModel) {
    const address = `${await this.getPublishEndpointRoot()}/restartstream`;
    await api.post(address, source);
  }

  public async publishOnvif(op: OnvifParams, type: OnvifAction) {
    const address = `${await this.getPublishEndpointRoot()}/onvif`;
    const par: OnvifEvent = {type: type, base64_model: btoa(JSON.stringify(op))};
    await api.post(address, par);
  }

  public async publishVideoMerge(event: VideMergeRequestEvent) {
    const address = `${await this.getPublishEndpointRoot()}/videomerge`;
    await api.post(address, event);
  }

  public async publishFrTrain(): Promise<void> {
    const address = `${await this.getPublishEndpointRoot()}/frtrain`;
    await api.post(address, {});
  }

  public async publishProbe(rtspAddress: string): Promise<void> {
    const address = `${await this.getPublishEndpointRoot()}/probe`;
    const params: ProbeRequestEvent = {address: rtspAddress};
    await api.post(address, params);
  }
}

export class SubscribeService extends BaseService {
  private readonly nodeIp: string;
  private readonly nodePort: number;

  constructor(nodeIp: string, nodePort: number) {
    super();
    this.nodeIp = nodeIp;
    this.nodePort = nodePort;
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
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsstartstream', null), onMessage);
  }

  public subscribeStopStream(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsstopstream', null), onMessage);
  }

  public subscribeEditor(requester: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wseditor', `requester=${requester}`), onMessage);
  }

  public subscribeFFmpegRead(sourceId: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsffmpegreader', `id=${sourceId}`), onMessage);
  }

  public subscribeOnvif(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsonvif', null), onMessage);
  }

  public subscribeVideomerge(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsvideomerge', null), onMessage);
  }

  public subscribeFrTrain(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsfrtrain', null), onMessage);
  }

  public subscribeProbe(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsprobe', null), onMessage);
  }

  public subscribeNotifier(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsnotifier', null), onMessage);
  }

  public subscribeUserLogout(onMessage: ((this: WebSocket, ev: MessageEvent) => any)): WsConnection {
    return new WsConnection(this.nodeIp, this.nodePort, this.setAuth('wsuserlogout', null), onMessage);
  }
}
