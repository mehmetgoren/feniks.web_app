import {PublishService} from 'src/utils/services/websocket_services';
import {SourceModel} from 'src/utils/models/source_model';
import axios from 'axios';
import {StoreService} from 'src/utils/services/store_service';
import {LocalService} from 'src/utils/services/local_service';
import {ProbeResult} from 'src/utils/models/various';


export function parseQs(qs = window.location.search): any {
  const urlSearchParams = new URLSearchParams(qs);
  const ret: any = {};
  const arr = urlSearchParams.entries().next().value;
  ret[arr[0].replace('node?', '')] = arr[1];
  return ret;
}

export function myDateToJsDate(dateString: string): Date {
  if (dateString) {
    const splits = dateString.split('_');
    if (splits.length && splits.length > 5) {
      const year = parseInt(splits[0]);
      const month = parseInt(splits[1]);
      const day = parseInt(splits[2]);
      const hour = parseInt(splits[3]);
      const minute = parseInt(splits[4]);
      const second = parseInt(splits[5]);
      return new Date(year, Math.max(month-1, 0), day, hour, minute, second);
    }
  }
  return new Date(0);
}

export function fixArrayDates(list: any[], ...fields: string[]) {
  list.forEach(item => {
    fields.forEach(field => {
      if (item[field]) {
        item[field] = myDateToJsDate(item[field]);
      }
    });
  });
}

export function getTodayString(separator = '_') {
  const today = new Date();
  const month = today.getMonth() + 1;
  let monthStr = month.toString();
  if (month < 10) {
    monthStr = '0' + monthStr;
  }
  const day = today.getDate();
  let dayStr = day.toString();
  if (day < 10) {
    dayStr = '0' + dayStr;
  }
  return `${today.getFullYear()}${separator}${monthStr}${separator}${dayStr}`;
}

export function getCurrentHour() {
  const today = new Date();
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function timeSince(date: Date): string {
  // @ts-ignore
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
}

export function isNullOrUndefined(val: any) {
  return val === undefined || val === null;
}

export function isNullOrEmpty(val: string | undefined | null) {
  //@ts-ignore
  return isNullOrUndefined(val) ? true : val.length === 0;
}

export function startStream(storeService: StoreService, publishService: PublishService, source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    console.error('invalid source object. Streaming request will not ben sent');
    return;
  }
  storeService.setSourceLoading(<string>source.id, true);
  publishService.publishStartStream(source).then(() => {
    console.log('stream request has been started');
  }).catch((err) => {
    console.log('stream request had an error: ' + err);
  });
}

export function createEmptyBase64Image(): string {
  return 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
}

export function downloadFile(url: string, fileName: string, fileType: string) {
  axios({
    url: url,
    method: 'GET',
    responseType: 'blob' // important
  }).then((response: any) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('downloadjs')(response.data, fileName, fileType);
  }).catch(console.error);
}

export function parseIP(address: string): string | null {
  const r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; //http://www.regular-expressions.info/examples.html
  const results = address.match(r);
  if (results && results.length) {
    return results[0];
  }
  return null;
}

export function checkIpIsLoopBack(ip: string): boolean {
  if (isNullOrEmpty(ip)) {
    return false;
  }
  const re = /^(127\.[\d.]+|[0:]+1|localhost)$/;
  return ip.match(re) !== null;
}

export function deepCopy(source: any): any {
  if (!source) {
    return source;
  }
  return JSON.parse(JSON.stringify(source));
}

export function isFrDirNameValid(name: string): boolean {
  const re = '/^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g';
  return name.match(re) === null;
}

export function generateHtmlColor(): string {
  return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

export function cutFloatString(val: number, size = 4): string{
  if (val){
    const str = val.toString();
    return str.substring(0, size);
  }
  return '';
}

export async function userLogout(localService: LocalService, storeService: StoreService, router: any) {
  localService.setCurrentUser(null);
  storeService.setCurrentUser(null);
  await router.push('/');
  setTimeout(() => {
    window.location.reload();
  }, 250);
}

export function findBestSettings(source: SourceModel, probeResult: ProbeResult): boolean {
  const f = probeResult.format;
  if (f.nb_streams < 1) {
    return false;
  }
  const hasAudio = f.nb_streams > 1;
  const v = probeResult.streams[0]; //video
  const fps = parseInt(v.avg_frame_rate.split('/')[0]);
  if (f.format_name === 'rtsp') {
    source.rtsp_transport = 1; //TCP
  }
  source.rtmp_server_type = 1; //SRS Realtime
  source.stream_type = 0; //FLV
  //todo: test it with dahua
  if (parseFloat(v.start_time) > 0.) {
    source.booster_enabled = true;
  }
  source.input_frame_rate = fps;
  source.stream_video_codec = 3; // copy
  source.preset = 1; //ultra fast
  // source.stream_frame_rate = fps;
  // source.stream_width = v.width;
  // source.stream_height = v.height;
  source.ffmpeg_reader_width = 1280;
  source.ffmpeg_reader_height = 720;
  source.ffmpeg_reader_frame_rate = fps;

  const a = hasAudio ? probeResult.streams[1] : null;
  const audioCodecs = hasAudio ? new LocalService().createAudioCodecs() : null;
  if (hasAudio) {
    // @ts-ignore
    for (const opt of audioCodecs) {
      if (opt.label.toLowerCase() === a?.codec_name) {
        source.stream_audio_codec = opt.value;
        break;
      }
    }
    source.stream_audio_channel = 0; //Source
    source.stream_audio_quality = 0; //Auto
    source.stream_audio_sample_rate = 0; //Auto
    source.stream_audio_volume = 100;
  }

  source.snapshot_frame_rate = 1;
  source.snapshot_width = 640;
  source.snapshot_height = 360;

  source.record_file_type = 0; //MP4
  source.record_preset = 1; //ultra fast
  source.record_video_codec = 5; //copy
  source.record_segment_interval = 15;
  source.record_frame_rate = 0;
  if (hasAudio) {
    source.record_audio_codec = source.stream_audio_codec;
    source.record_audio_channel = source.stream_audio_channel;
    source.record_audio_quality = source.stream_audio_quality;
    source.record_audio_sample_rate = source.stream_audio_sample_rate; //Auto
    source.record_audio_volume = source.stream_audio_volume;
  }

  source.log_level = 5; //Warning

  return true;
}
