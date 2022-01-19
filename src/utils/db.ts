import Dexie from 'dexie';
import {Node} from './entities';

const db = new Dexie('nodes');

db.version(1).stores({
  nodes: 'node_address, name, description, enabled'
});


console.log('Using Dexie v' + Dexie.semVer);

export class NodeRepository {
  private readonly db : any;
  constructor() {
    this.db = db
  }

  public getAll(): Promise<Node[]>{
    return this.db.nodes.toArray();
  }

  public async save(node: Node): Promise<Node> {
    const record = await this.db.nodes.where('node_address').equalsIgnoreCase(node.node_address).toArray();
    if (record.length > 0){
      return this.db.nodes.put(node);
    } else {
      return this.db.nodes.add(node);
    }
  }

  public delete(node: Node) {
    return this.db.nodes.delete(node.node_address);
  }
}
