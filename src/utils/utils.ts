import {PublishService} from 'src/utils/services/websocket_services';
import {SourceModel} from 'src/utils/models/source_model';
import axios from 'axios';
import {StoreService} from 'src/utils/services/store_service';
import {LocalService} from 'src/utils/services/local_service';
import {ProbeResult} from 'src/utils/models/various';
import {date} from 'quasar'
import Scrollbar from 'smooth-scrollbar';
import {GalleryLocationsService} from 'src/utils/services/gallery_locations_service';


export const localIp = '127.0.0.1';

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
      return new Date(year, Math.max(month - 1, 0), day, hour, minute, second);
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

export function getTodayString(separator = '_'): string {
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

export function getCurrentHour(): string {
  const today = new Date();
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function getAddedHour(addHour: number): string {
  const today = new Date();
  const currentHour = today.getHours();
  today.setHours(currentHour + addHour);
  const hour = today.getHours();
  let hourStr = hour.toString();
  if (hour < 10) {
    hourStr = '0' + hourStr;
  }
  return hourStr;
}

export function getPrevHourDatetime(prevHour: number, separator = '_') {
  const now = new Date();
  const prevHourDate = date.addToDate(now, {hours: -1 * prevHour})

  const month = prevHourDate.getMonth() + 1;
  let monthStr = month.toString();
  if (month < 10) {
    monthStr = '0' + monthStr;
  }
  const day = prevHourDate.getDate();
  let dayStr = day.toString();
  if (day < 10) {
    dayStr = '0' + dayStr;
  }

  const pvHour = prevHourDate.getHours();
  let hourStr = pvHour.toString();
  if (pvHour < 10) {
    hourStr = '0' + hourStr;
  }
  return `${prevHourDate.getFullYear()}${separator}${monthStr}${separator}${dayStr}${separator}${hourStr}`;
}

export function timeSince(date: Date, t: any): string {
  // @ts-ignore
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('years');
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('months');
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('days');
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('hours');
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' ' + t('minutes');
  }
  return Math.floor(seconds) + ' ' + t('seconds');
}

export function isNullOrUndefined(val: any) {
  return val === undefined || val === null;
}

export function isNullOrEmpty(val: string | undefined | null) {
  //@ts-ignore
  return isNullOrUndefined(val) ? true : val.length === 0;
}

export function parseQueryString(queryString: string = window.location.search): any {
  return new Proxy(new URLSearchParams(queryString), {
    get: (searchParams, prop) => searchParams.get(<any>prop),
  });
}

export function startStream(storeService: StoreService, publishService: PublishService, gls: GalleryLocationsService,  source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    return;
  }
  gls.registerGsLocation(<string>source.id);
  storeService.setSourceLoading(<string>source.id, true);
  void publishService.publishStartStream(source);
}

export function stopStream(storeService: StoreService, publishService: PublishService, gls: GalleryLocationsService, source: SourceModel) {
  if (isNullOrEmpty(source?.id)) {
    return;
  }
  gls.removeGsLocation(<string>source.id);
  publishService.publishStopStream(source).then(() => {
    setTimeout(() =>{
      storeService.setNotifySourceStreamStatusChanged();
    }, 3000);
  }).catch(console.error);
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

export function downloadFile2(url: string) {
  const a: any = document.createElement('a');
  try {
    a.target = '_blank'
    a.href = url;
    a.download = url.substr(url.lastIndexOf('/') + 1);
    document.body.appendChild(a);
    a.click();
  } finally {
    document.body.removeChild(a);
  }
}

export function downloadObjectAsJson(exportObj: any, exportName:string){
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href',     dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function parseIP(address: string | null | undefined): string | null {
  if (address === null || address === undefined) {
    return null;
  }
  if (address.indexOf('localhost') !== -1) {
    return 'localhost';
  }

  const r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/; //http://www.regular-expressions.info/examples.html
  const results = address.match(r);
  if (results && results.length) {
    return results[0];
  }
  return null;
}


export function parsePort(address: string | null | undefined): number | null {
  if (address === null || address === undefined) {
    return null;
  }
  const r = /:\d{1,5}/;
  const results = address.match(r);
  if (results && results.length) {
    return parseInt(results[0].substring(1));
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

export function isFaceDirNameValid(name: string): boolean {
  const re = '/^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g';
  return name.match(re) === null;
}

export function formatJson(json: string): string {
  return JSON.stringify(JSON.parse(json), null, '\t');
}

export function setupLocale(localService: LocalService, locale: any, $q: any) {
  let localeTemp: any = localService.getLang();
  if (!localeTemp) {
    localeTemp = $q.lang.getLocale();
    localService.setLang(localeTemp);
  }
  locale.value = localeTemp;
}

export function getImageSrc(locale: any) {
  if (locale.value === 'tr-TR') {
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLXRyIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPGcgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxwYXRoIGZpbGw9IiNlMzBhMTciIGQ9Ik0wIDBoNjQwdjQ4MEgweiIvPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQwNyAyNDcuNWMwIDY2LjItNTQuNiAxMTkuOS0xMjIgMTE5LjlzLTEyMi01My43LTEyMi0xMjAgNTQuNi0xMTkuOCAxMjItMTE5LjggMTIyIDUzLjcgMTIyIDExOS45eiIvPgogICAgPHBhdGggZmlsbD0iI2UzMGExNyIgZD0iTTQxMyAyNDcuNWMwIDUzLTQzLjYgOTUuOS05Ny41IDk1LjlzLTk3LjYtNDMtOTcuNi05NiA0My43LTk1LjggOTcuNi05NS44IDk3LjYgNDIuOSA5Ny42IDk1Ljl6Ii8+CiAgICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJtNDMwLjcgMTkxLjUtMSA0NC4zLTQxLjMgMTEuMiA0MC44IDE0LjUtMSA0MC43IDI2LjUtMzEuOCA0MC4yIDE0LTIzLjItMzQuMSAyOC4zLTMzLjktNDMuNSAxMi0yNS44LTM3eiIvPgogIDwvZz4KPC9zdmc+Cg==';
  }
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWdiIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAxMjE2OSIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI0ZGRiIgZD0ibTc1IDAgMjQ0IDE4MUw1NjIgMGg3OHY2Mkw0MDAgMjQxbDI0MCAxNzh2NjFoLTgwTDMyMCAzMDEgODEgNDgwSDB2LTYwbDIzOS0xNzhMMCA2NFYwaDc1eiIvPgogIDxwYXRoIGZpbGw9IiNDODEwMkUiIGQ9Im00MjQgMjgxIDIxNiAxNTl2NDBMMzY5IDI4MWg1NXptLTE4NCAyMCA2IDM1TDU0IDQ4MEgwbDI0MC0xNzl6TTY0MCAwdjNMMzkxIDE5MWwyLTQ0TDU5MCAwaDUwek0wIDBsMjM5IDE3NmgtNjBMMCA0MlYweiIvPgogIDxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0yNDEgMHY0ODBoMTYwVjBIMjQxek0wIDE2MHYxNjBoNjQwVjE2MEgweiIvPgogIDxwYXRoIGZpbGw9IiNDODEwMkUiIGQ9Ik0wIDE5M3Y5Nmg2NDB2LTk2SDB6TTI3MyAwdjQ4MGg5NlYwaC05NnoiLz4KPC9zdmc+Cg==';
}

export function toBase64(file: File): Promise<any>{
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function createTrDateLocale(): any {
  return {
    days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    daysShort: ['Pzr', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthsShort: ['Ock', 'Şbt', 'Mrt', 'Nsn', 'Mys', 'Hzn', 'Tmz', 'Ağs', 'Eyl', 'Ekm', 'Ksm', 'Arl']
  };
}

export function createLongDateLocale(): any {
  return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
}

export function scrollbarInit(elemId: string): Scrollbar | null {
  const elm = document.querySelector('#' + elemId);
  if (elm) {
    //@ts-ignore
    return Scrollbar.init(elm)
  }
  return null;
}

export function isFullScreen(): boolean {
  return !window.screenTop && !window.screenY;
}

export function isMaximized(): boolean {
  const w = window.innerWidth / screen.availWidth;
  const h = window.innerHeight / screen.availHeight;
  return ((w + h) / 2.) > .94;
}

export function listenWindowSizeChangesForScrollBar(refHeight: any) {
  window.addEventListener('resize', function () {
    setTimeout(() => {
      const multiplier = .95;
      const isFoM = isFullScreen() || isMaximized();
      refHeight.value = (window.innerHeight * multiplier) - (isFoM ? 0 : 32);
    });
  }, true);
}

export async function databindWithLoading(loading: any, fn: () => Promise<void>) {
  loading.value = true;
  try {
    await fn();
  } finally {
    loading.value = false;
  }
}

export function validateModel<T>(t:any, empty: T, viewModel:T): string[]{
  const ret: string[] = [];
  for (const [field, value] of Object.entries(<any>empty)){
    if (!value || Array.isArray(value)) continue; // means nullable or array

    const typeName = typeof value;
    if (typeName === 'object'){
      //@ts-ignore
      const addItems = validateModel(t, empty[field], viewModel[field]);
      for(const item of addItems){
        ret.push(item);
      }
    }
    //@ts-ignore
    const viewValue = viewModel[field];
     switch (typeName){
       case 'string':
         if (!viewValue){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }
         break;
       case 'number':
         if (!viewValue){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }else if (isNaN(viewValue)){
           ret.push(`${t('please_enter_valid_number')} for ${t(field)}`);
         }
         break;
       case 'boolean':
         if (isNullOrUndefined(viewValue)){
           ret.push(`${t('please_enter_value')} for ${t(field)}`);
         }
         break;
     }
  }
  return ret;
}

export async function doUserLogout(localService: LocalService, storeService: StoreService, router: any) {
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
  const fps = parseFloat(v.avg_frame_rate.split('/')[0]);
  if (f.format_name === 'rtsp') {
    source.rtsp_transport = 1; //TCP
  }
  source.ms_type = 1; //SRS Realtime
  source.stream_type = 0; //FLV
  // if (parseFloat(v.start_time) > 0.) {
  //   source.booster_enabled = true;
  // }
  // source.input_frame_rate = fps;
  source.stream_video_codec = 3; // copy
  source.preset = 1; // ultra fast
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

  source.snapshot_frame_rate = 1.0;
  source.snapshot_width = 1280;
  source.snapshot_height = 720;

  source.record_file_type = 0; //MP4
  source.record_preset = 1; //ultra fast
  source.record_video_codec = 6; //copy
  source.record_segment_interval = 15;
  source.record_frame_rate = 0.0;
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
