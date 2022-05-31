import { Node } from 'src/utils/entities';
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
  activeTab: Node;
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
    links1: [
      { route: 'home?c=index', icon: 'web', text: 'Dashboard' },
      { route: 'home?c=nodes', icon: 'add_box', text: 'Nodes' }
    ],
    links2: [
      { route: 'home?c=hub', icon: 'hub', text: 'Hub' }
    ]
  };
  return {
    dense: true,
    menu: {
      'home': links,
      '': links
    },
    activeTab: { name: 'home', description: '', enabled: true, node_address: '' },
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
