import { api } from 'boot/axios';
import { CameraDto } from 'src/utils/entities';
import { BaseService } from 'src/utils/services/base_service';
import { IonixHubAddress } from 'src/utils/utils';


export class HubService extends BaseService {
  private readonly _hubAddress: string;

  public constructor() {
    super();
    this._hubAddress = 'http://' + IonixHubAddress + '/api/v1';
  }

  public async getAll(): Promise<CameraDto[]> {
    const resp = await api.get(this._hubAddress + '/camera');
    return resp.data;
  }
}
