import { api } from 'boot/axios';
import {Config} from 'src/utils/models/config';
import {BaseService} from 'src/utils/services/base_service';
import {List} from 'linqts';
import {SourceModel} from 'src/utils/models/source_model';
import {VideoFile} from 'src/utils/entities';
import {isNullOrEmpty} from 'src/utils/utils';
import {StreamModel} from 'src/utils/models/stream_model';
import {SourceEnabledModel, SourceStatusModel} from 'src/utils/models/source_status_model';
import {SmartVisionModel} from 'src/utils/models/ai_model';
import {ImagesParams, FolderTreeItem, ImageItem} from 'src/utils/models/detected';
import {AiClipViewModel, AiClipQueryViewModel} from 'src/utils/models/ai_clip_view_models';
import {FaceTrainRename, FaceTrainName, FaceTrainScreenshotViewModel, FaceTrainViewModel} from 'src/utils/models/face_models';
import {ClientInfoModel, LoginUserViewModel, RegisterUserViewModel, User, LoginUserByTokenViewModel} from 'src/utils/models/user_model';
import {RegisterWebAppServiceModel, ServiceModel, ServiceViewModel} from 'src/utils/models/service_model';
import {ServerStats} from 'src/utils/models/server_stats';
import {FailedStreamModel, RecStuckModel, RtspTemplateModel, VariousInfos} from 'src/utils/models/others_models';
import {NvidiaGpuModel} from 'src/utils/models/gpu';
import {GdriveViewModel, TelegramViewModel} from 'src/utils/models/cloud_models';
import {AiDataDeleteOptions, AiDataDto, QueryAiDataAdvancedParams} from 'src/utils/models/ai_data_dtos';
import { AiModuleModel } from 'src/utils/models/ai_module_model';


export class NodeService extends BaseService {

  constructor() {
    super();
  }

  public async getSourceList(): Promise<SourceModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('sources'));
    return new List(<SourceModel[]>resp.data).OrderBy(x => x.name).ToArray();
  }

  public async getSource(sourceId: string): Promise<SourceModel> {
    const resp = await api.get(this.LocalService.getServerAddress(`sources/${sourceId}`));
    return resp.data;
  }

  public async saveSource(model: SourceModel): Promise<SourceModel> {
    const resp = await api.post(this.LocalService.getServerAddress('sources'), model);
    return resp.data;
  }

  public async removeSource(sourceId: string): Promise<boolean> {
    if (isNullOrEmpty(sourceId)) {
      return false;
    }
    await api.delete(this.LocalService.getServerAddress(`sources/${sourceId}`));
    return true;
  }

  public async getSourceStreamStatus(): Promise<SourceStatusModel[]> {
    const response = await api.get(this.LocalService.getServerAddress('sourcestreamstatus'));
    return response.data;
  }

  public async setSourceEnabled(model: SourceEnabledModel): Promise<SourceModel> {
    const response = await api.post(this.LocalService.getServerAddress('setsourceenabled'), model);
    return response.data;
  }

  public async getStreamList(): Promise<StreamModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('stream'));
    return resp.data;
  }

  public async getStream(sourceId: string): Promise<StreamModel> {
    const resp = await api.get(this.LocalService.getServerAddress(`stream/${sourceId}`));
    return resp.data;
  }

  public async getConfig(): Promise<Config> {
    const resp = await api.get(this.LocalService.getServerAddress('config'));
    return resp.data;
  }

  public async saveConfig(config: Config): Promise<Config> {
    const resp = await api.post(this.LocalService.getServerAddress('config'), config);
    return resp.data;
  }

  public async restoreConfig(): Promise<Config> {
    const resp = await api.get(this.LocalService.getServerAddress('restoreconfig'));
    return resp.data;
  }

  public async getRecordHours(sourceId: string, dateStr: string): Promise<string[]> {
    const resp = await api.get(this.LocalService.getServerAddress(`recordhours/${sourceId}/${dateStr}`));
    return resp.data;
  }

  public async getRecords(sourceId: string, dateStr: string, hour: string): Promise<VideoFile[]> {
    const resp = await api.get(this.LocalService.getServerAddress(`records/${sourceId}/${dateStr}/${hour}`));
    return resp.data;
  }

  public async deleteRecord(model: VideoFile): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress('records'), {data: model});
    return resp.data;
  }

  public async getSmartVision(sourceId: string): Promise<SmartVisionModel | null> {
    const resp = await api.get(this.LocalService.getServerAddress(`smartvisions/${sourceId}`));
    return resp.data;
  }

  public async getSmartVisions(): Promise<SmartVisionModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('smartvisions'));
    return resp.data;
  }

  public async saveSmartVision(model: SmartVisionModel): Promise<SmartVisionModel> {
    const resp = await api.post(this.LocalService.getServerAddress('smartvisions'), model);
    return resp.data;
  }

  public async getAiImagesFolders(sourceId: string, date: string): Promise<FolderTreeItem[]> {
    const resp = await api.get(this.LocalService.getServerAddress(`aiimagesfolders/${sourceId}/${date}`));
    return [resp.data];
  }

  public async getAiImages(model: ImagesParams): Promise<ImageItem[]> {
    const resp = await api.post(this.LocalService.getServerAddress('aiimages'), model);
    return resp.data;
  }

  public async getAiClips(params: AiClipQueryViewModel): Promise<AiClipViewModel[]> {
    const resp = await api.post(this.LocalService.getServerAddress('aiclips'), params);
    return resp.data;
  }

  public async deleteAiClip(vm: AiClipViewModel): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress('aiclips'), {data: vm});
    return resp.data;
  }

  public async getFaceTrainPersons(): Promise<FaceTrainViewModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('facetrainpersons'));
    return resp.data;
  }

  public async getFaceTrainPersonImages(person: string): Promise<ImageItem[]> {
    const resp = await api.get(this.LocalService.getServerAddress(`facetrainpersonimages/${person}`));
    return resp.data;
  }

  public async deleteFaceTrainPersonImage(imgSrc: string): Promise<boolean> {
    const b64 = btoa(imgSrc);
    const resp = await api.delete(this.LocalService.getServerAddress(`facetrainpersonimage/${b64}`));
    return resp.data;
  }

  public async saveFaceTrainPersonImage(model: FaceTrainScreenshotViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('facetrainpersonimage'), model);
    return resp.data;
  }

  public async renameFaceTrainPersonName(model: FaceTrainRename): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('facetrainpersonrename'), model);
    return resp.data;
  }

  public async newFaceTrainPerson(model: FaceTrainName): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('facetrainpersonnew'), model);
    return resp.data;
  }

  public async deleteFaceTrainPerson(model: FaceTrainName): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress('facetrainpersondelete'), {data: model});
    return resp.data;
  }


  public async login(user: LoginUserViewModel): Promise<User> {
    const resp = await api.post(this.LocalService.getServerAddress('login'), user);
    return resp.data;
  }

  public async loginByToken(tokenModel: LoginUserByTokenViewModel): Promise<User> {
    const resp = await api.post(this.LocalService.getServerAddress('loginbytoken'), tokenModel);
    return resp.data;
  }

  public async registerUser(user: RegisterUserViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('registeruser'), user);
    return resp.data;
  }

  public async getServices(): Promise<ServiceViewModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('services'));
    return resp.data;
  }

  public async registerWebAppService(model: RegisterWebAppServiceModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('registerwebappservice'), model);
    return resp.data;
  }

  public async stopService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('stopservice'), service);
    return resp.data;
  }

  public async startService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('startservice'), service);
    return resp.data;
  }

  public async restartService(service: ServiceModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('restartservice'), service);
    return resp.data;
  }

  public async restartAfterCloudChanges(): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('restartaftercloudchanges'));
    return resp.data;
  }

  public async restartAllServices(): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('restartallservices'));
    return resp.data;
  }

  public async getUsers(): Promise<User[]> {
    const resp = await api.get(this.LocalService.getServerAddress('users'));
    return resp.data;
  }

  public async deleteUser(id: string): Promise<number> {
    const resp = await api.delete(this.LocalService.getServerAddress(`users/${id}`));
    return resp.data;
  }

  public async logoutUser(user: User): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('logoutuser'), user);
    return resp.data;
  }

  public async getServerStats(): Promise<ServerStats> {
    try {
      const resp = await api.get(this.LocalService.getServerAddress('serverstats'));
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
    const resp = await api.get(this.LocalService.getServerAddress('rtsptemplates'));
    return resp.data;
  }

  public async getFailedStreams(): Promise<FailedStreamModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('failedstreams'));
    return resp.data;
  }

  public async getRecStucks(): Promise<RecStuckModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('recstucks'));
    return resp.data;
  }

  public async getVariousInfos(): Promise<VariousInfos> {
    const resp = await api.get(this.LocalService.getServerAddress('various'));
    return resp.data;
  }

  public async getNvidiaSmi(): Promise<NvidiaGpuModel> {
    const resp = await api.get(this.LocalService.getServerAddress('nvidiasmi'));
    return resp.data;
  }

  public async getTelegramViewModel(): Promise<TelegramViewModel> {
    const resp = await api.get(this.LocalService.getServerAddress('telegram'));
    return resp.data;
  }

  public async saveTelegramViewModel(viewModel: TelegramViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('telegram'), viewModel);
    return resp.data;
  }

  public async deleteTelegramUser(userId: number): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress(`telegramuser/${userId}`));
    return resp.data;
  }

  public async getGdriveViewModel(): Promise<GdriveViewModel> {
    const resp = await api.get(this.LocalService.getServerAddress('gdrive'));
    return resp.data;
  }

  public async saveGdriveViewModel(viewModel: GdriveViewModel): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('gdrive'), viewModel);
    return resp.data;
  }

  public async resetGdriveTokenAndUrl(): Promise<boolean> {
    const resp = await api.post(this.LocalService.getServerAddress('resetgdrivetokenandurl'));
    return resp.data;
  }

  public async queryAiDataAdvanced(model: QueryAiDataAdvancedParams): Promise<AiDataDto[]> {
    const resp = await api.post(this.LocalService.getServerAddress('queryaidataadvanced'), model);
    return resp.data;
  }

  public async queryAiDataCount(model: QueryAiDataAdvancedParams): Promise<number> {
    const resp = await api.post(this.LocalService.getServerAddress('queryaidatacount'), model);
    return resp.data;
  }

  public async deleteAiData(model: AiDataDeleteOptions): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress('deleteaidata'), {data: model});
    return resp.data;
  }

  public async getIsReadOnlyMode(): Promise<boolean> {
    const resp = await api.get(this.LocalService.getServerAddress('isReadOnlyMode'));
    return resp.data;
  }

  public async getClientInfo(): Promise<ClientInfoModel | null> {
    const resp = await api.get('https://cloudflare.com/cdn-cgi/trace');
    const data = resp.data.trim().split('\n').reduce(function (obj: any, pair: string) {
      const pairs = pair.split('=');
      return obj[pairs[0]] = pairs[1], obj;
    }, {});

    let ret: any = null;
    if (data && data.ip) {
      ret = {};
      ret.ip = data.ip;
      ret.uag = data.uag;
      ret.location = data.loc;
      ret.data_center_location = data.colo;
    }

    return ret;
  }

  public async getAiModules(): Promise<AiModuleModel[]> {
    const resp = await api.get(this.LocalService.getServerAddress('aimodules'));
    return resp.data;
  }

  public async saveAiModule(model:AiModuleModel): Promise<AiModuleModel> {
    const resp = await api.post(this.LocalService.getServerAddress('aimodule'), model);
    return resp.data;
  }

  public async deleteAiModule(id: string): Promise<boolean> {
    const resp = await api.delete(this.LocalService.getServerAddress(`aimodule/${id}`));
    return resp.data;
  }
}
