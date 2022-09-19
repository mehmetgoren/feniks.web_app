import {isNullOrEmpty, isNullOrUndefined} from 'src/utils/utils';
import {LocalService} from 'src/utils/services/local_service';

export class GalleryLocationsService {
  private readonly localSerivice: LocalService;
  private readonly userToken: string | null;

  constructor(localService: LocalService) {
    this.localSerivice = localService;
    this.userToken = this.localSerivice.getCurrentUser()?.token ?? null;
  }

  private getKey(sourceId: string): string | null {
    if (!sourceId) return null;
    if (!this.userToken) return null;

    return `${this.userToken}_${sourceId}`;
  }

  public addGsLocationByUser(sourceId: string, option: GsLocation) {
    if (isNullOrEmpty(sourceId) || isNullOrUndefined(option))
      return;
    localStorage.setItem(sourceId, JSON.stringify(option));
  }

  public isAddedByUser(sourceId: string): boolean {
    return this.getGsLocation(sourceId) !== null;
  }

  public getGsLocation(sourceId: string): GsLocation | null {
    const json = localStorage.getItem(sourceId);
    if (json) {
      return JSON.parse(json);
    }
    return null;
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

  public deleteGsLocation(sourceId: string) {
    localStorage.removeItem(sourceId);
  }
}

export interface GsLocation {
  w: number;
  h: number;
  x: number;
  y: number;
}

