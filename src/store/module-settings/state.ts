import { Source } from 'src/utils/entities';

export interface MenuLink {
  route?: string | null;
  text?: string | null;
  icon?: string;
  href?:string;
  id?:string | null;
  source?:Source | null;
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
  activeTab: string;
  activeLeftMenu: MenuLink | null;
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
    activeTab: 'home',
    activeLeftMenu:null,
  };
}

export default state;
