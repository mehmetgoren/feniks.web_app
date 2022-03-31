import { api } from 'boot/axios';
import { Config } from 'src/utils/models/config';
import { BaseService } from 'src/utils/services/base-service';
import { List } from 'linqts';
import { SourceModel } from 'src/utils/models/source_model';
import { VideoFile } from 'src/utils/entities';
import { isNullOrEmpty } from 'src/utils/utils';
import { StreamModel } from 'src/utils/models/stream_model';
import { SourceStatusModel } from 'src/utils/models/source_status_model';
import { OdModel } from 'src/utils/models/od_model';
import { DetectedImagesParams, FolderTreeItem, ImageItem } from 'src/utils/models/detected';


export class NodeService extends BaseService {

  public getAddress(route: string) : string{
    return `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/${route}`;
  }

  public async getSourceList(): Promise<SourceModel[]> {
    const resp = await api.get(this.getAddress('sources'));
    return new List(<SourceModel[]>resp.data).OrderBy(x => x.name).ToArray();
  }

  public async getSource(sourceId: string): Promise<SourceModel> {
    const resp = await api.get(this.getAddress(`sources/${sourceId}`));
    return resp.data;
  }

  public async saveSource(model: SourceModel): Promise<SourceModel> {
    const resp = await api.post(this.getAddress('sources'), model);
    return resp.data;
  }

  public async removeSource(sourceId: string): Promise<boolean> {
    if (isNullOrEmpty(sourceId)) {
      return false;
    }
    await api.delete(this.getAddress(`sources/${sourceId}`));
    return true;
  }

  public async getSourceStreamStatus(): Promise<SourceStatusModel[]> {
    const response = await api.get(this.getAddress('sourcestreamstatus'));
    return response.data;
  }

  public async getStreamList(): Promise<StreamModel[]> {
    const resp = await api.get(this.getAddress('stream'));
    return resp.data;
  }

  public async getStream(sourceId: string): Promise<StreamModel> {
    const resp = await api.get(this.getAddress(`stream/${sourceId}`));
    return resp.data;
  }

  public async getConfig(): Promise<Config> {
    const resp = await api.get(this.getAddress('config'));
    return resp.data;
  }

  public async saveConfig(config: Config): Promise<Config> {
    const resp = await api.post(this.getAddress('config'), config);
    return resp.data;
  }

  public async restoreConfig(): Promise<Config> {
    const resp = await api.get(this.getAddress('restoreconfig'));
    return resp.data;
  }

  public async getVideos(sourceId: string): Promise<VideoFile[]> {
    const resp = await api.get(this.getAddress(`videos/${sourceId}`));
    return resp.data;
  }

  public async deleteVideos(sourceId: string, videoIds: string[]): Promise<void> {
    const resp = await api.delete(this.getAddress(`videos/${sourceId}`), { data: videoIds });
    return resp.data;
  }

  public async getOd(sourceId: string): Promise<OdModel | null>{
    const resp = await api.get(this.getAddress(`ods/${sourceId}`))
    return resp.data;
  }

  public async saveOd(model: OdModel): Promise<OdModel>{
    const resp = await api.post(this.getAddress('ods'), model);
    return resp.data;
  }

  public async deleteOd(sourceId: string): Promise<boolean>{
    await api.delete(this.getAddress(`ods/${sourceId}`));
    return true;
  }

  public async getDetectedFolders(): Promise<FolderTreeItem[]>{
    const resp = await api.get(this.getAddress('detectedfolders'));
    return [resp.data];
  }

  public async getDetectedImages(model: DetectedImagesParams): Promise<ImageItem[]>{
    const resp = await api.post(this.getAddress('detectedimages'), model);
    return resp.data;
  }
}
