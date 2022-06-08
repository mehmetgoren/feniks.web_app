import { LocalService } from 'src/utils/services/local_service';
import { isNullOrEmpty } from 'src/utils/utils';

export class WsConnection {
  private _ws: WebSocket | null;
  private readonly _endPoint: string;
  private readonly _onMessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
  private _closedByMe: boolean;
  private readonly _localService: LocalService;
  private readonly _adddress: string;
  private _timeout: NodeJS.Timeout | null;

  constructor(endPoint: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any) | null) {
    this._ws = null;
    this._endPoint = endPoint;
    this._onMessage = onMessage;
    this._closedByMe = false;
    this._localService = new LocalService();
    this._adddress = `ws://${this._localService.nodeIP}:${this._localService.nodePort}/${this._endPoint}`;
    this._timeout = null;
    this._init();
  }

  private _init() {
    this._ws = new WebSocket(this._adddress);
    const me = this;
    this._ws.onopen = () => {
      // @ts-ignore
      console.info('[WS] Connected, status: ' + me._ws.readyState);
    };
    this._ws.onerror = (err) => {
      console.error('[WS] Error: ' + err);
    };
    this._ws.onclose = (ev) => {
      console.info('[WS] Closed, status: ' + ev.code);
      me._ws = null;
      this._timeout = setTimeout(() => {
        if (!me._closedByMe) {
          const user = me._localService.getCurrentUser();
          if (user != null && !isNullOrEmpty(user.token)){
            me._init();
          }else{
            me.close();
          }
        }
      }, 2000);
    };
    this._ws.onmessage = this._onMessage;
  }

  public send(message: string) {
    if (this._ws) {
      this._ws.send(message);
    }
  }

  public close() {
    if (this._ws) {
      this._ws.close();
      this._closedByMe = true;
      this._ws = null;
      if (this._timeout){
        clearTimeout(this._timeout);
      }
      console.info('[WS] Closed by me');
    }
  }
}
