import { api } from 'boot/axios';
import { Config } from 'src/utils/models/config';
import { BaseService } from 'src/utils/services/base-service';
import { List } from 'linqts';
import { SourceModel } from 'src/utils/models/source_model';
import { VideoFile } from 'src/utils/entities';
import { isNullEmpty } from 'src/utils/utils';
import { StreamModel } from 'src/utils/models/stream_model';
import { SourceStatusModel } from 'src/utils/models/source_status_model';


export class NodeService extends BaseService {
  public async getSourceList(): Promise<SourceModel[]> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/sources`;
    const resp = await api.get(address);
    return new List(<SourceModel[]>resp.data).OrderBy(x => x.name).ToArray();
  }

  public async getSource(sourceId: string): Promise<SourceModel> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/sources/${sourceId}`;
    const resp = await api.get(address);
    return resp.data;
  }

  public async saveSource(model: SourceModel): Promise<SourceModel> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/sources`;
    const resp = await api.post(address, model);
    return resp.data;
  }

  public async removeSource(sourceId: string): Promise<boolean> {
    if (isNullEmpty(sourceId)) {
      return false;
    }
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/sources/${sourceId}`;
    await api.delete(address);
    return true;
  }

  public async getSourceStreamStatus(): Promise<SourceStatusModel[]>{
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/sourcestreamstatus`;
    const response = await api.get(address);
    return response.data;
  }

  public async getStreamList(): Promise<StreamModel[]>{
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/stream`;
    const resp = await api.get(address);
    return resp.data;
  }
  public async getStream(sourceId: string): Promise<StreamModel> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/stream/${sourceId}`;
    const resp = await api.get(address);
    return resp.data;
  }

  public async getConfig(): Promise<Config> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/config`;
    const resp = await api.get(address);
    return resp.data;
  }

  public async saveConfig(config: Config): Promise<Config> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/config`;
    const resp = await api.post(address, config);
    return resp.data;
  }

  public async restoreConfig(): Promise<Config> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/restoreconfig`;
    const resp = await api.get(address);
    return resp.data;
  }

  public async getVideos(sourceId: string): Promise<VideoFile[]> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/videos/${sourceId}`;
    const resp = await api.get(address);
    return resp.data;
  }

  public async deleteVideos(sourceId: string, videoIds: string[]): Promise<void> {
    const address = `${this.nodeHttpProtocol}://${this.nodeAddress}:${this.defaultPort}/videos/${sourceId}`;
    const resp = await api.delete(address, { data: videoIds });
    return resp.data;
  }

  public getCoco80Names() {
    return [{ label: 'person', value: 0 }, { label: 'bicycle', value: 1 }, {
      label: 'car',
      value: 2
    }, { label: 'motorbike', value: 3 }, { label: 'aeroplane', value: 4 }, { label: 'bus', value: 5 }, {
      label: 'train',
      value: 6
    }, { label: 'truck', value: 7 }, { label: 'boat', value: 8 }, {
      label: 'traffic light',
      value: 9
    }, { label: 'fire hydrant', value: 10 }, { label: 'stop sign', value: 11 }, {
      label: 'parking meter',
      value: 12
    }, { label: 'bench', value: 13 }, { label: 'bird', value: 14 }, { label: 'cat', value: 15 }, {
      label: 'dog',
      value: 16
    }, { label: 'horse', value: 17 }, { label: 'sheep', value: 18 }, { label: 'cow', value: 19 }, {
      label: 'elephant',
      value: 20
    }, { label: 'bear', value: 21 }, { label: 'zebra', value: 22 }, {
      label: 'giraffe',
      value: 23
    }, { label: 'backpack', value: 24 }, { label: 'umbrella', value: 25 }, {
      label: 'handbag',
      value: 26
    }, { label: 'tie', value: 27 }, { label: 'suitcase', value: 28 }, { label: 'frisbee', value: 29 }, {
      label: 'skis',
      value: 30
    }, { label: 'snowboard', value: 31 }, { label: 'sports ball', value: 32 }, {
      label: 'kite',
      value: 33
    }, { label: 'baseball bat', value: 34 }, { label: 'baseball glove', value: 35 }, {
      label: 'skateboard',
      value: 36
    }, { label: 'surfboard', value: 37 }, { label: 'tennis racket', value: 38 }, {
      label: 'bottle',
      value: 39
    }, { label: 'wine glass', value: 40 }, { label: 'cup', value: 41 }, { label: 'fork', value: 42 }, {
      label: 'knife',
      value: 43
    }, { label: 'spoon', value: 44 }, { label: 'bowl', value: 45 }, { label: 'banana', value: 46 }, {
      label: 'apple',
      value: 47
    }, { label: 'sandwich', value: 48 }, { label: 'orange', value: 49 }, {
      label: 'broccoli',
      value: 50
    }, { label: 'carrot', value: 51 }, { label: 'hot dog', value: 52 }, { label: 'pizza', value: 53 }, {
      label: 'donut',
      value: 54
    }, { label: 'cake', value: 55 }, { label: 'chair', value: 56 }, {
      label: 'sofa',
      value: 57
    }, { label: 'pottedplant', value: 58 }, { label: 'bed', value: 59 }, {
      label: 'diningtable',
      value: 60
    }, { label: 'toilet', value: 61 }, { label: 'tvmonitor', value: 62 }, {
      label: 'laptop',
      value: 63
    }, { label: 'mouse', value: 64 }, { label: 'remote', value: 65 }, {
      label: 'keyboard',
      value: 66
    }, { label: 'cell phone', value: 67 }, { label: 'microwave', value: 68 }, {
      label: 'oven',
      value: 69
    }, { label: 'toaster', value: 70 }, { label: 'sink', value: 71 }, {
      label: 'refrigerator',
      value: 72
    }, { label: 'book', value: 73 }, { label: 'clock', value: 74 }, { label: 'vase', value: 75 }, {
      label: 'scissors',
      value: 76
    }, { label: 'teddy bear', value: 77 }, { label: 'hair drier', value: 78 }, { label: 'toothbrush', value: 79 }];
  }

  public getCoco91Names() {
    return [{ label: 'person', value: 0 }, { label: 'bicycle', value: 1 }, {
      label: 'car',
      value: 2
    }, { label: 'motorcycle', value: 3 }, { label: 'airplane', value: 4 }, { label: 'bus', value: 5 }, {
      label: 'train',
      value: 6
    }, { label: 'truck', value: 7 }, { label: 'boat', value: 8 }, {
      label: 'traffic light',
      value: 9
    }, { label: 'fire hydrant', value: 10 }, { label: 'street sign', value: 11 }, {
      label: 'stop sign',
      value: 12
    }, { label: 'parking meter', value: 13 }, { label: 'bench', value: 14 }, { label: 'bird', value: 15 }, {
      label: 'cat',
      value: 16
    }, { label: 'dog', value: 17 }, { label: 'horse', value: 18 }, { label: 'sheep', value: 19 }, {
      label: 'cow',
      value: 20
    }, { label: 'elephant', value: 21 }, { label: 'bear', value: 22 }, { label: 'zebra', value: 23 }, {
      label: 'giraffe',
      value: 24
    }, { label: 'hat', value: 25 }, { label: 'backpack', value: 26 }, { label: 'umbrella', value: 27 }, {
      label: 'shoe',
      value: 28
    }, { label: 'eye glasses', value: 29 }, { label: 'handbag', value: 30 }, {
      label: 'tie',
      value: 31
    }, { label: 'suitcase', value: 32 }, { label: 'frisbee', value: 33 }, {
      label: 'skis',
      value: 34
    }, { label: 'snowboard', value: 35 }, { label: 'sports ball', value: 36 }, {
      label: 'kite',
      value: 37
    }, { label: 'baseball bat', value: 38 }, { label: 'baseball glove', value: 39 }, {
      label: 'skateboard',
      value: 40
    }, { label: 'surfboard', value: 41 }, { label: 'tennis racket', value: 42 }, {
      label: 'bottle',
      value: 43
    }, { label: 'plate', value: 44 }, { label: 'wine glass', value: 45 }, { label: 'cup', value: 46 }, {
      label: 'fork',
      value: 47
    }, { label: 'knife', value: 48 }, { label: 'spoon', value: 49 }, { label: 'bowl', value: 50 }, {
      label: 'banana',
      value: 51
    }, { label: 'apple', value: 52 }, { label: 'sandwich', value: 53 }, {
      label: 'orange',
      value: 54
    }, { label: 'broccoli', value: 55 }, { label: 'carrot', value: 56 }, {
      label: 'hot dog',
      value: 57
    }, { label: 'pizza', value: 58 }, { label: 'donut', value: 59 }, { label: 'cake', value: 60 }, {
      label: 'chair',
      value: 61
    }, { label: 'couch', value: 62 }, { label: 'potted plant', value: 63 }, {
      label: 'bed',
      value: 64
    }, { label: 'mirror', value: 65 }, { label: 'dining table', value: 66 }, {
      label: 'window',
      value: 67
    }, { label: 'desk', value: 68 }, { label: 'toilet', value: 69 }, { label: 'door', value: 70 }, {
      label: 'tv',
      value: 71
    }, { label: 'laptop', value: 72 }, { label: 'mouse', value: 73 }, { label: 'remote', value: 74 }, {
      label: 'keyboard',
      value: 75
    }, { label: 'cell phone', value: 76 }, { label: 'microwave', value: 77 }, {
      label: 'oven',
      value: 78
    }, { label: 'toaster', value: 79 }, { label: 'sink', value: 80 }, {
      label: 'refrigerator',
      value: 81
    }, { label: 'blender', value: 82 }, { label: 'book', value: 83 }, { label: 'clock', value: 84 }, {
      label: 'vase',
      value: 85
    }, { label: 'scissors', value: 86 }, { label: 'teddy bear', value: 87 }, {
      label: 'hair drier',
      value: 88
    }, { label: 'toothbrush', value: 89 }, { label: 'hair brush', value: 90 }];
  }
}
