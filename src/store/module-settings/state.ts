import { SourceModel } from 'src/utils/models/source_model';
import { User } from 'src/utils/models/user_model';

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
  addSourceClicked: boolean;
  sourceStreamStatusChanged: boolean;
  aiSettingsClicked: boolean;
  aiSettingsSourceId: string;
  currentUser: User | null;
}

export interface LoadingInfo {
  id: string;
  loading: boolean;
}

function state(): ISettingsState {
  const links: MenuItem = {
    config: [
      { route: 'node?x=config', icon: 'settings', text: 'Configuration', name:'config' },
    ],
    stream_gallery: [
      { route: 'node?x=stream_gallery', icon: 'apps', text: 'Stream Gallery', name:'stream_gallery' }
    ],
    add_source:[
      { route: 'node?x=add_source', icon: 'add_box', text: 'Add Source', name:'add_source' }
    ],
    fr_train:[
      { route: 'node?x=fr_train', icon: 'face', text: 'Face Training', name:'fr_train' }
    ],
    ai_data:[
      { route: 'node?x=ai_data', icon: 'lens_blur', text: 'AI Data', name:'ai_data' }
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
    addSourceClicked: false,
    sourceStreamStatusChanged: false,
    aiSettingsClicked: false,
    aiSettingsSourceId: '',
    currentUser: null
  };
}

export default state;
