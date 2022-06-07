import { LocalService } from 'src/utils/services/local_service';
// import axios from 'axios';
import { api } from 'boot/axios';


export abstract class BaseService {
  private readonly _localService: LocalService;

  protected constructor() {
    this._localService = new LocalService();
    const token = this.getUserToken();
    if (token){
      const opts = api.defaults.headers.options;
      if (opts){
        opts['user'] = token;
      }
      api.defaults.headers.get['user'] = token;
      api.defaults.headers.post['user'] = token;
      api.defaults.headers.delete['user'] = token;
    }
  }

  protected getUserToken(): string | null{
    return this._localService.getCurrentUser()?.token ?? null;
  }

  get LocalService(): LocalService {
    return this._localService;
  }

}
