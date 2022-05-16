import { LocalService } from 'src/utils/services/local_service';


export abstract class BaseService {
  private readonly _localService: LocalService;

  constructor() {
    this._localService = new LocalService();
  }


  get LocalService(): LocalService {
    return this._localService;
  }

}
