import { NodeMngrAddress } from 'src/utils/utils';

export class WsConnection {
  private _ws: WebSocket | null;
  private readonly _endPoint: string;
  private readonly _onMessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
  private _closedByMe: boolean;

  constructor(endPoint: string, onMessage: ((this: WebSocket, ev: MessageEvent) => any) | null) {
    this._ws = null;
    this._endPoint = endPoint;
    this._onMessage = onMessage;
    this._closedByMe = false;
    this._init();
  }

  private _init() {
    this._ws = new WebSocket('ws://' + NodeMngrAddress + '/' + this._endPoint);
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
      setTimeout(() => {
        if (!me._closedByMe) {
          me._init();
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
      console.info('[WS] Closed by me');
    }
  }
}
