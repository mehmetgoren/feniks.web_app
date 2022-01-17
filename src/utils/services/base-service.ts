import { NodeMngrPort } from 'src/utils/utils';

export abstract class BaseService {
  protected readonly _defaultPort: string;

  constructor() {
    this._defaultPort = NodeMngrPort;
  }
}
