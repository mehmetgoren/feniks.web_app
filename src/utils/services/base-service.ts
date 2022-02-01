import { NodeMngrPort } from 'src/utils/utils';
import { LocalService } from 'src/utils/services/local-service';

export abstract class BaseService {
  private readonly _localService: LocalService;

  constructor() {
    this._localService = new LocalService();
  }

  get defaultPort() :string{
    return NodeMngrPort
  }

  get nodeAddress(): string{
    const node = this._localService.getActiveTab();
    if (node)
      return node.node_address;
    return '';
  }

  get nodeHttpProtocol(): string{
    return 'http';
  }
}
