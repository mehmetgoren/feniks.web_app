import { Node, Source } from 'src/utils/entities';

export interface MenuLink {
  route?: string | null;
  text?: string | null;
  icon?: string;
  href?:string;
  id?:string | null;
  source?:Source | null;
  isSource?:boolean | null;
  thumbnail?:string | null;
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
  sourceLoading: boolean;
}

function state(): ISettingsState {
  const links: MenuItem = {
    links1: [
      { route: 'home', icon: 'web', text: 'Dashboard' },
      { route: 'home-nodes', icon: 'add_box', text: 'Nodes'},
    ],
    links2: [
      { route: 'home-hub', icon: 'domain', text: 'Hub'},
    ],
    links3: [
      { icon: 'open_in_new', text: 'Github', href:'https://github.com/mehmetgoren' },
      { icon: 'open_in_new', text: 'Get the Android app' },
      { icon: 'open_in_new', text: 'Get the iOS app' },
    ]
  };
  return {
    dense: true,
    menu: {
      'home': links,
      '': links,
    },
    activeTab: { name: 'home', description:'', enabled:true, node_address:'' },
    activeLeftMenu:null,
    sourceLoading:false,
  };
}

export default state;
