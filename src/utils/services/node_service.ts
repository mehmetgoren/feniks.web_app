import { api } from 'boot/axios';
import { Config } from 'src/utils/models/config';
import { BaseService } from 'src/utils/services/base_service';
import { List } from 'linqts';
import { SourceModel } from 'src/utils/models/source_model';
import { VideoFile } from 'src/utils/entities';
import { isNullOrEmpty } from 'src/utils/utils';
import { StreamModel } from 'src/utils/models/stream_model';
import { SourceStatusModel } from 'src/utils/models/source_status_model';
import { OdModel } from 'src/utils/models/od_model';
import { OdImagesParams, FolderTreeItem, ImageItem } from 'src/utils/models/detected';
import { OdVideoClipsViewModel } from 'src/utils/models/video_clip_json_object';


export class NodeService extends BaseService {

  public getAddress(route: string): string {
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

  public async getRecords(sourceId: string): Promise<VideoFile[]> {
    const resp = await api.get(this.getAddress(`records/${sourceId}`));
    return resp.data;
  }

  public async deleteRecord(sourceId: string, videoIds: string[]): Promise<void> {
    const resp = await api.delete(this.getAddress(`records/${sourceId}`), { data: videoIds });
    return resp.data;
  }

  public async getOd(sourceId: string): Promise<OdModel | null> {
    const resp = await api.get(this.getAddress(`ods/${sourceId}`));
    return resp.data;
  }

  public async saveOd(model: OdModel): Promise<OdModel> {
    const resp = await api.post(this.getAddress('ods'), model);
    return resp.data;
  }

  public async getOdImagesFolders(sourceId: string): Promise<FolderTreeItem[]> {
    const resp = await api.get(this.getAddress(`odimagesfolders/${sourceId}`));
    return [resp.data];
  }

  public async getOdImages(model: OdImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(this.getAddress('odimages'), model);
    return resp.data;
  }

  public async getOdVideoClips(sourceId: string, date: string): Promise<OdVideoClipsViewModel[]> {
    const resp = await api.get(this.getAddress(`odvideoclips/${sourceId}/${date}`));
    return resp.data;
  }

  public async deleteOdVideoClip(item: OdVideoClipsViewModel): Promise<boolean> {
    const resp = await api.delete(this.getAddress('odvideoclips'), { data: item });
    return resp.data;
  }
}
