import { IState } from 'src/store';
import { PublishService } from 'src/utils/services/websocket_services';
import { Store } from 'vuex';
import { SourceModel } from 'src/utils/models/source_model';
import axios from 'axios';

export const NodeMngrPort = '2072';
export const NodeMngrAddress = 'localhost:' + NodeMngrPort;
export const IonixHubAddress = 'localhost:7242';

export function parseQs(qs = window.location.search) {
  const urlSearchParams = new URLSearchParams(qs);
  const params = Object.fromEntries(urlSearchParams.entries());
  return params;
}

export function myDateToJsDate(dateString: string): Date {
  if (dateString){
    const splits = dateString.split('_');
    if (splits.length && splits.length > 5){
      const year = parseInt(splits[0]);
      const month = parseInt(splits[1]);
      const day = parseInt(splits[2]);
      const hour = parseInt(splits[3]);
      const minute = parseInt(splits[4]);
      const second = parseInt(splits[5]);
      return new Date(year, month, day, hour, minute, second);
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


export function getTodayString(){
  const today = new Date();
  return `${today.getFullYear()}_${(today.getMonth()+1)}_${today.getDate()}`
}

export function getTodayHourString(){
  const today = new Date();
  return `${today.getFullYear()}_${(today.getMonth()+1)}_${today.getDate()}_${today.getHours()}`
}

export function isNullOrUndefined(val: any){
  return val === undefined || val === null;
}

export function isNullOrEmpty(val: string | undefined | null){
  //@ts-ignore
  return isNullOrUndefined(val) ? true : val.length === 0;
}

export function startStream($store: Store<IState>, publishService: PublishService, source: SourceModel) {
  if (isNullOrEmpty(source?.id)){
    console.error('invalid source object. Streaming request will not ben sent');
    return;
  }
  $store.commit('settings/setSourceLoading', {id:source.id, loading: true});
  publishService.publishStartStream(source).then(() => {
    console.log('stream request has been started');
  }).catch((err) => {
    console.log('stream request had an error: ' + err);
  });
}

export function createEmptyBase64Image(): string{
  return 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
}

export function downloadFile(url: string, fileName: string, fileType :string){
  axios({
    url: url,
    method: 'GET',
    responseType: 'blob' // important
  }).then((response: any) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('downloadjs')(response.data, fileName, fileType);
  }).catch(console.error);
}
