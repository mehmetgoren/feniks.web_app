import { NodeMngrPort } from 'src/utils/utils';
import { LocalService } from 'src/utils/services/local-service';

export abstract class BaseService {
  protected readonly _defaultPort: string;
  private readonly _localService: LocalService;

  constructor() {
    this._defaultPort = NodeMngrPort;
    this._localService = new LocalService();
  }

  get nodeAddress(): string{
    const node = this._localService.getActiveTab();
    if (node)
      return node.node_address;
    return '';
  }
}
