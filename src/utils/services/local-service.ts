import { Node } from 'src/utils/entities';

export class LocalService{

  public getActiveTab() : Node | null{
    const json =  sessionStorage.getItem('setActiveTab');
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }
  public setActiveTab(node: Node){
    sessionStorage.setItem('setActiveTab', JSON.stringify(node));
  }
}
