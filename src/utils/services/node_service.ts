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
import { ImagesParams, FolderTreeItem, ImageItem } from 'src/utils/models/detected';
import { OdVideoClipsViewModel } from 'src/utils/models/ai_clip_json_object';
import { NetworkDiscoveryModel, OnvifModel } from 'src/utils/models/onvif_models';
import { FrTrainRename, FrTrainName, FrTrainScreenshotViewModel, FrTrainViewModel } from 'src/utils/models/fr_models';
import { LoginUserViewModel, RegisterUserViewModel, User } from 'src/utils/models/user_model';
import { ServiceModel } from 'src/utils/models/service_model';


export class NodeService extends BaseService {
  constructor() {
    super();
  }

  public async getSourceList(): Promise<SourceModel[]> {
    const resp = await api.get(this.LocalService.getNodeAddress('sources'));
    return new List(<SourceModel[]>resp.data).OrderBy(x => x.name).ToArray();
  }

  public async getSource(sourceId: string): Promise<SourceModel> {
    const resp = await api.get(this.LocalService.getNodeAddress(`sources/${sourceId}`));
    return resp.data;
  }

  public async saveSource(model: SourceModel): Promise<SourceModel> {
    const resp = await api.post(this.LocalService.getNodeAddress('sources'), model);
    return resp.data;
  }

  public async removeSource(sourceId: string): Promise<boolean> {
    if (isNullOrEmpty(sourceId)) {
      return false;
    }
    await api.delete(this.LocalService.getNodeAddress(`sources/${sourceId}`));
    return true;
  }

  public async getSourceStreamStatus(): Promise<SourceStatusModel[]> {
    const response = await api.get(this.LocalService.getNodeAddress('sourcestreamstatus'));
    return response.data;
  }

  public async getStreamList(): Promise<StreamModel[]> {
    const resp = await api.get(this.LocalService.getNodeAddress('stream'));
    return resp.data;
  }

  public async getStream(sourceId: string): Promise<StreamModel> {
    const resp = await api.get(this.LocalService.getNodeAddress(`stream/${sourceId}`));
    return resp.data;
  }

  public async getConfig(): Promise<Config> {
    const resp = await api.get(this.LocalService.getNodeAddress('config'));
    return resp.data;
  }

  public async saveConfig(config: Config): Promise<Config> {
    const resp = await api.post(this.LocalService.getNodeAddress('config'), config);
    return resp.data;
  }

  public async restoreConfig(): Promise<Config> {
    const resp = await api.get(this.LocalService.getNodeAddress('restoreconfig'));
    return resp.data;
  }

  public async getRecordHours(sourceId: string, dateStr: string): Promise<string[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`recordhours/${sourceId}/${dateStr}`));
    return resp.data;
  }

  public async getRecords(sourceId: string, dateStr: string, hour: string): Promise<VideoFile[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`records/${sourceId}/${dateStr}/${hour}`));
    return resp.data;
  }

  public async deleteRecord(model: VideoFile): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getNodeAddress('records'), { data: model });
    return resp.data;
  }

  public async getOd(sourceId: string): Promise<OdModel | null> {
    const resp = await api.get(this.LocalService.getNodeAddress(`ods/${sourceId}`));
    return resp.data;
  }

  public async saveOd(model: OdModel): Promise<OdModel> {
    const resp = await api.post(this.LocalService.getNodeAddress('ods'), model);
    return resp.data;
  }

  public async getOdImagesFolders(sourceId: string, date: string): Promise<FolderTreeItem[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`odimagesfolders/${sourceId}/${date}`));
    return [resp.data];
  }

  public async getOdImages(model: ImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(this.LocalService.getNodeAddress('odimages'), model);
    return resp.data;
  }

  public async getOdVideoClips(sourceId: string, date: string): Promise<OdVideoClipsViewModel[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`odvideoclips/${sourceId}/${date}`));
    return resp.data;
  }

  public async deleteOdVideoClip(item: OdVideoClipsViewModel): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getNodeAddress('odvideoclips'), { data: item });
    return resp.data;
  }

  public async getFrImagesFolders(sourceId: string, date: string): Promise<FolderTreeItem[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`frimagesfolders/${sourceId}/${date}`));
    return [resp.data];
  }

  public async getFrImages(model: ImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(this.LocalService.getNodeAddress('frimages'), model);
    return resp.data;
  }

  public async getFrTrainPersons(): Promise<FrTrainViewModel[]> {
    const resp = await api.get(this.LocalService.getNodeAddress('frtrainpersons'));
    return resp.data;
  }

  public async getFrTrainPersonImages(person: string): Promise<ImageItem[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`frtrainpersonimages/${person}`));
    return resp.data;
  }

  public async deleteFrTrainPersonImage(imgSrc: string): Promise<boolean> {
    const b64 = btoa(imgSrc);
    const resp = await api.delete(this.LocalService.getNodeAddress(`frtrainpersonimage/${b64}`));
    return resp.data;
  }

  public async saveFrTrainPersonImage(model: FrTrainScreenshotViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getNodeAddress('frtrainpersonimage'), model);
    return resp.data;
  }

  public async renameFrTrainPersonName(model: FrTrainRename): Promise<boolean> {
    const resp = await api.post(this.LocalService.getNodeAddress('frtrainpersonrename'), model);
    return resp.data;
  }

  public async newFrTrainPerson(model: FrTrainName): Promise<boolean> {
    const resp = await api.post(this.LocalService.getNodeAddress('frtrainpersonnew'), model);
    return resp.data;
  }

  public async deleteFrTrainPerson(model: FrTrainName): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getNodeAddress('frtrainpersondelete'), { data: model });
    return resp.data;
  }

  public async getAlprImagesFolders(sourceId: string, date: string): Promise<FolderTreeItem[]> {
    const resp = await api.get(this.LocalService.getNodeAddress(`alprimagesfolders/${sourceId}/${date}`));
    return [resp.data];
  }

  public async getAlprImages(model: ImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(this.LocalService.getNodeAddress('alprimages'), model);
    return resp.data;
  }

  public async getOnvifNetwork(): Promise<NetworkDiscoveryModel> {
    const resp = await api.get(this.LocalService.getNodeAddress('onvifnetwork'));
    return resp.data;
  }

  public async getOnvif(address: string): Promise<OnvifModel> {
    const resp = await api.get(this.LocalService.getNodeAddress(`onvif/${address}`));
    return resp.data;
  }

  public async login(user: LoginUserViewModel): Promise<User> {
    const resp = await api.post(this.LocalService.getNodeAddress('login'), user);
    return resp.data;
  }

  public async registerUser(user: RegisterUserViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getNodeAddress('registeruser'), user);
    return resp.data;
  }

  public async getServices(): Promise<ServiceModel[]> {
    const resp = await api.get(this.LocalService.getNodeAddress('services'));
    return resp.data;
  }

  public async getUsers(): Promise<User[]> {
    const resp = await api.get(this.LocalService.getNodeAddress('users'));
    return resp.data;
  }

  public async deleteUser(id: string): Promise<number> {
    const resp = await api.delete(this.LocalService.getNodeAddress(`users/${id}`));
    return resp.data;
  }
}
