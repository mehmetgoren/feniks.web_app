import {api} from 'boot/axios';
import {Config} from 'src/utils/models/config';
import {BaseService} from 'src/utils/services/base_service';
import {List} from 'linqts';
import {SourceModel} from 'src/utils/models/source_model';
import {VideoFile} from 'src/utils/entities';
import {isNullOrEmpty} from 'src/utils/utils';
import {StreamModel} from 'src/utils/models/stream_model';
import {SourceEnabledModel, SourceStatusModel} from 'src/utils/models/source_status_model';
import {OdModel} from 'src/utils/models/od_model';
import {ImagesParams, FolderTreeItem, ImageItem} from 'src/utils/models/detected';
import {AiClipViewModel, AiClipQueryViewModel} from 'src/utils/models/ai_clip_view_models';
import {NetworkDiscoveryModel, OnvifModel} from 'src/utils/models/onvif_models';
import {FrTrainRename, FrTrainName, FrTrainScreenshotViewModel, FrTrainViewModel} from 'src/utils/models/fr_models';
import {ClientInfoModel, LoginUserViewModel, RegisterUserViewModel, User} from 'src/utils/models/user_model';
import {ServiceModel, ServiceViewModel} from 'src/utils/models/service_model';
import {ServerStats} from 'src/utils/models/server_stats';
import {FailedStreamModel, RecStuckModel, RtspTemplateModel, VariousInfos} from 'src/utils/models/others_models';
import {NvidiaGpuModel} from 'src/utils/models/gpu';
import {GdriveViewModel, TelegramViewModel} from 'src/utils/models/cloud_models';
import {AiDataDeleteOptions, AiDataDto, QueryAiDataAdvancedParams, QueryAiDataParams} from 'src/utils/models/ai_data_dtos';


export class NodeService extends BaseService {
  constructor() {
    super();
  }

  public async getSourceList(): Promise<SourceModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('sources'));
    return new List(<SourceModel[]>resp.data).OrderBy(x => x.name).ToArray();
  }

  public async getSource(sourceId: string): Promise<SourceModel> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`sources/${sourceId}`));
    return resp.data;
  }

  public async saveSource(model: SourceModel): Promise<SourceModel> {
    const resp = await api.post(await this.LocalService.getNodeAddress('sources'), model);
    return resp.data;
  }

  public async removeSource(sourceId: string): Promise<boolean> {
    if (isNullOrEmpty(sourceId)) {
      return false;
    }
    await api.delete(await this.LocalService.getNodeAddress(`sources/${sourceId}`));
    return true;
  }

  public async getSourceStreamStatus(): Promise<SourceStatusModel[]> {
    const response = await api.get(await this.LocalService.getNodeAddress('sourcestreamstatus'));
    return response.data;
  }

  public async setSourceEnabled(model: SourceEnabledModel): Promise<SourceModel> {
    const response = await api.post(await this.LocalService.getNodeAddress('setsourceenabled'), model);
    return response.data;
  }

  public async getStreamList(): Promise<StreamModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('stream'));
    return resp.data;
  }

  public async getStream(sourceId: string): Promise<StreamModel> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`stream/${sourceId}`));
    return resp.data;
  }

  public async getConfig(): Promise<Config> {
    const resp = await api.get(await this.LocalService.getNodeAddress('config'));
    return resp.data;
  }

  public async saveConfig(config: Config): Promise<Config> {
    const resp = await api.post(await this.LocalService.getNodeAddress('config'), config);
    return resp.data;
  }

  public async restoreConfig(): Promise<Config> {
    const resp = await api.get(await this.LocalService.getNodeAddress('restoreconfig'));
    return resp.data;
  }

  public async getRecordHours(sourceId: string, dateStr: string): Promise<string[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`recordhours/${sourceId}/${dateStr}`));
    return resp.data;
  }

  public async getRecords(sourceId: string, dateStr: string, hour: string): Promise<VideoFile[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`records/${sourceId}/${dateStr}/${hour}`));
    return resp.data;
  }

  public async deleteRecord(model: VideoFile): Promise<boolean> {
    const resp = await api.delete(await this.LocalService.getNodeAddress('records'), {data: model});
    return resp.data;
  }

  public async getOd(sourceId: string): Promise<OdModel | null> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`ods/${sourceId}`));
    return resp.data;
  }

  public async getOds(): Promise<OdModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('ods'));
    return resp.data;
  }

  public async saveOd(model: OdModel): Promise<OdModel> {
    const resp = await api.post(await this.LocalService.getNodeAddress('ods'), model);
    return resp.data;
  }

  public async getAiImagesFolders(sourceId: string, date: string, aiType: number): Promise<FolderTreeItem[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`aiimagesfolders/${sourceId}/${date}/${aiType}`));
    return [resp.data];
  }

  public async getOdImages(model: ImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(await this.LocalService.getNodeAddress('aiimages'), model);
    return resp.data;
  }

  public async getAiClips(params: AiClipQueryViewModel): Promise<AiClipViewModel[]> {
    const resp = await api.post(await this.LocalService.getNodeAddress('aiclips'), params);
    return resp.data;
  }

  public async deleteAiClip(vm: AiClipViewModel): Promise<boolean> {
    const resp = await api.delete(await this.LocalService.getNodeAddress('aiclips'), {data: vm});
    return resp.data;
  }

  public async getFrTrainPersons(): Promise<FrTrainViewModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('frtrainpersons'));
    return resp.data;
  }

  public async getFrTrainPersonImages(person: string): Promise<ImageItem[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`frtrainpersonimages/${person}`));
    return resp.data;
  }

  public async deleteFrTrainPersonImage(imgSrc: string): Promise<boolean> {
    const b64 = btoa(imgSrc);
    const resp = await api.delete(await this.LocalService.getNodeAddress(`frtrainpersonimage/${b64}`));
    return resp.data;
  }

  public async saveFrTrainPersonImage(model: FrTrainScreenshotViewModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('frtrainpersonimage'), model);
    return resp.data;
  }

  public async renameFrTrainPersonName(model: FrTrainRename): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('frtrainpersonrename'), model);
    return resp.data;
  }

  public async newFrTrainPerson(model: FrTrainName): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('frtrainpersonnew'), model);
    return resp.data;
  }

  public async deleteFrTrainPerson(model: FrTrainName): Promise<boolean> {
    const resp = await api.delete(await this.LocalService.getNodeAddress('frtrainpersondelete'), {data: model});
    return resp.data;
  }

  public async getOnvifNetwork(): Promise<NetworkDiscoveryModel | null> {
    const resp = await api.get(await this.LocalService.getNodeAddress('onvifnetwork'));
    return resp.data;
  }

  public async getOnvif(address: string): Promise<OnvifModel | null> {
    const resp = await api.get(await this.LocalService.getNodeAddress(`onvif/${address}`));
    return resp.data;
  }

  public async login(user: LoginUserViewModel): Promise<User> {
    const resp = await api.post(await this.LocalService.getNodeAddress('login'), user);
    return resp.data;
  }

  public async registerUser(user: RegisterUserViewModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('registeruser'), user);
    return resp.data;
  }

  public async getServices(): Promise<ServiceViewModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('services'));
    return resp.data;
  }

  public async registerWebAppService(): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('registerwebappservice'));
    return resp.data;
  }

  public async stopService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('stopservice'), service);
    return resp.data;
  }

  public async startService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('startservice'), service);
    return resp.data;
  }

  public async restartService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('restartservice'), service);
    return resp.data;
  }

  public async restartAfterCloudChanges(): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('restartaftercloudchanges'));
    return resp.data;
  }

  public async restartAllServices(): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('restartallservices'));
    return resp.data;
  }

  public async getUsers(): Promise<User[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('users'));
    return resp.data;
  }

  public async deleteUser(id: string): Promise<number> {
    const resp = await api.delete(await this.LocalService.getNodeAddress(`users/${id}`));
    return resp.data;
  }

  public async logoutUser(user: User): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('logoutuser'), user);
    return resp.data;
  }

  public async getServerStats(): Promise<ServerStats> {
    try {
      const resp = await api.get(await this.LocalService.getNodeAddress('serverstats'));
      return resp.data;
    } catch (e: any) {
      if (e.code && e.code === 'ERR_NETWORK') {
        this.LocalService.setCurrentUser(null);
        window.location.href = '/';
        window.location.reload();
      }
      return <any>undefined;
    }
  }

  public async getRtspTemplates(): Promise<RtspTemplateModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('rtsptemplates'));
    return resp.data;
  }

  public async getFailedStreams(): Promise<FailedStreamModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('failedstreams'));
    return resp.data;
  }

  public async getRecStucks(): Promise<RecStuckModel[]> {
    const resp = await api.get(await this.LocalService.getNodeAddress('recstucks'));
    return resp.data;
  }

  public async getVariousInfos(): Promise<VariousInfos> {
    const resp = await api.get(await this.LocalService.getNodeAddress('various'));
    return resp.data;
  }

  public async getNvidiaSmi(): Promise<NvidiaGpuModel> {
    const resp = await api.get(await this.LocalService.getNodeAddress('nvidiasmi'));
    return resp.data;
  }

  public async getTelegramViewModel(): Promise<TelegramViewModel> {
    const resp = await api.get(await this.LocalService.getNodeAddress('telegram'));
    return resp.data;
  }

  public async saveTelegramViewModel(viewModel: TelegramViewModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('telegram'), viewModel);
    return resp.data;
  }

  public async deleteTelegramUser(userId: number): Promise<boolean> {
    const resp = await api.delete(await this.LocalService.getNodeAddress(`telegramuser/${userId}`));
    return resp.data;
  }

  public async getGdriveViewModel(): Promise<GdriveViewModel> {
    const resp = await api.get(await this.LocalService.getNodeAddress('gdrive'));
    return resp.data;
  }

  public async saveGdriveViewModel(viewModel: GdriveViewModel): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('gdrive'), viewModel);
    return resp.data;
  }

  public async resetGdriveTokenAndUrl(): Promise<boolean> {
    const resp = await api.post(await this.LocalService.getNodeAddress('resetgdrivetokenandurl'));
    return resp.data;
  }

  public async queryAiData(model: QueryAiDataParams): Promise<AiDataDto[]> {
    const resp = await api.post(await this.LocalService.getNodeAddress('queryaidata'), model);
    return resp.data;
  }

  public async queryAiDataAdvanced(model: QueryAiDataAdvancedParams): Promise<AiDataDto[]> {
    const resp = await api.post(await this.LocalService.getNodeAddress('queryaidataadvanced'), model);
    return resp.data;
  }

  public async queryAiDataCount(model: QueryAiDataAdvancedParams): Promise<number> {
    const resp = await api.post(await this.LocalService.getNodeAddress('queryaidatacount'), model);
    return resp.data;
  }

  public async deleteAiData(model: AiDataDeleteOptions): Promise<boolean> {
    const resp = await api.delete(await this.LocalService.getNodeAddress('deleteaidata'), {data: model});
    return resp.data;
  }

  public async getIsReadOnlyMode(): Promise<boolean> {
    const resp = await api.get(await this.LocalService.getNodeAddress('isReadOnlyMode'));
    return resp.data;
  }

  public async getClientInfo(): Promise<ClientInfoModel | null> {
    const resp = await api.get('https://cloudflare.com/cdn-cgi/trace');
    const data = resp.data.trim().split('\n').reduce(function (obj: any, pair: string) {
      const pairs = pair.split('=');
      return obj[pairs[0]] = pairs[1], obj;
    }, {});

    let ret : any = null;
    if (data && data.ip){
      ret = {};
      ret.ip = data.ip;
      ret.uag = data.uag;
      ret.location = data.loc;
      ret.data_center_location = data.colo;
    }

    return ret;
  }
}
