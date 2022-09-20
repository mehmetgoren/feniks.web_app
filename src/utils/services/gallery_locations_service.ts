import {isNullOrUndefined} from 'src/utils/utils';
import {LocalService} from 'src/utils/services/local_service';

export class GalleryLocationsService {
  private readonly localService: LocalService;
  private readonly userToken: string | null;

  constructor(localService: LocalService) {
    this.localService = localService;
    this.userToken = this.localService.getCurrentUser()?.token ?? null;
  }

  private getKey(sourceId: string): string | null {
    if (!sourceId) return null;
    if (!this.userToken) return null;

    return `${this.userToken}_${sourceId}`;
  }

  public registerGsLocation(sourceId: string){
    const key = this.getKey(sourceId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify({}));
  }

  public saveGsLocationWithOption(sourceId: string, option: GsLocation) {
    const key = this.getKey(sourceId);
    if (!key || isNullOrUndefined(option)) return;
    localStorage.setItem(key, JSON.stringify(option));
  }

  public hasLocation(sourceId: string): boolean {
    return this.getGsLocation(sourceId) !== null;
  }

  public getGsLocation(sourceId: string): GsLocation | null {
    const key = this.getKey(sourceId);
    if (!key) return null;

    const json = localStorage.getItem(key);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }

  public removeGsLocation(sourceId: string) {
    const key = this.getKey(sourceId);
    if (!key) return null;

    localStorage.removeItem(key);
  }

  public getGsLocations(): GsLocation[] {
    const ret: GsLocation[] = [];
    Object.keys(localStorage).forEach(function (key) {
      const strValue = localStorage.getItem(key)
      if (strValue && strValue.startsWith('{')) {
        const gso = JSON.parse(strValue);
        if (gso && gso.x !== undefined && gso.y !== undefined) {
          ret.push(gso);
        }
      }
    });
    return ret;
  }
}

export interface GsLocation {
  w: number;
  h: number;
  x: number;
  y: number;
}

