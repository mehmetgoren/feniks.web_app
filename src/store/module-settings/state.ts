import { SourceModel } from 'src/utils/models/source_model';
import { User } from 'src/utils/models/user_model';

export enum StreamCommandBarActions{
  ShowSourceSettings = 0,
  CloseSourceSettings = 1,
  SaveSource = 2,
  DeleteSource = 3
}

export interface StreamCommandBarInfo{
  source: any; //SourceModel
  action: StreamCommandBarActions;
}

export interface MenuLink {
  route?: string | null;
  text?: string | null;
  icon?: string;
  href?: string;
  id?: string | null;
  source?: SourceModel | null;
  isSource?: boolean | null;
  thumbnail?: string | null;

  name?: string | null;
}

export interface MenuItem {
  [name: string]: MenuLink[];
}

export interface MenuObject {
  [name: string]: MenuItem;
}

export interface ISettingsState {
  dense: boolean;
  menu: MenuObject;
  activeLeftMenu: MenuLink | null;
  sourceLoading: LoadingInfo;
  sourceStreamStatusChanged: boolean;
  aiSettingsSourceId: string;
  recordSourceId: string;
  currentUser: User | null;
  clickedStreamCommandBar: StreamCommandBarInfo | null;
  readonlyMode: boolean;
}

export interface LoadingInfo {
  id: string;
  loading: boolean;
}

function state(): ISettingsState {
  const links: MenuItem = {
    config: [
      { route: 'node_conf', icon: 'settings', text: 'Configuration', name:'config' },
    ],
    stream_gallery: [
      { route: 'stream_gallery', icon: 'apps', text: 'Stream Gallery', name:'stream_gallery' }
    ],
    add_source:[
      { route: 'add_source', icon: 'add_box', text: 'Add Source', name:'add_source' }
    ],
    face_training:[
      { route: 'face_training', icon: 'face', text: 'Face Training', name:'face_training' }
    ],
    ai_data:[
      { route: 'ai_data', icon: 'auto_awesome', text: 'AI Data', name:'ai_data' }
    ],
    cameras:[]
  };
  return {
    dense: true,
    menu: {
      'node':links
    },
    activeLeftMenu: null,
    sourceLoading: { id: '', loading: false },
    sourceStreamStatusChanged: false,
    aiSettingsSourceId: '',
    recordSourceId: '',
    currentUser: null,
    clickedStreamCommandBar: null,
    readonlyMode:false
  };
}

export default state;
