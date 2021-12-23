import { api } from 'boot/axios';
import { Plugin } from 'src/utils/entities';
import { BaseService } from 'src/utils/services/base-service';
import { List } from 'linqts'


export class NodeService extends BaseService {
  private readonly _defaultPort :string;
  constructor() {
    super();
    this._defaultPort = '2072';
  }

  public async getPlugins(nodeAddress : string): Promise<Plugin[]> {
    const address = 'http://'+  nodeAddress+ ':' + this._defaultPort + '/plugins';
    const resp = await api.get(address);
    return new List(<Plugin[]>resp.data).OrderBy(x => x.name).ToArray();
  }
}
