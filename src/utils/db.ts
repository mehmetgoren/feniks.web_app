import Dexie, { Table } from 'dexie';
import { Node } from './entities';

const db = new Dexie('nodes');

db.version(1).stores({
  nodes: 'node_address, name, description, active'
});

export class NodeRepository {
  private readonly nodes: Table<Node>;

  constructor() {
    //@ts-ignore
    this.nodes = db.nodes;
  }

  public getAll(): Promise<Node[]> {
    return this.nodes.toArray();
  }

  public async save(node: Node): Promise<Node> {
    if (node.active) {
      const all = await this.nodes.toArray();
      for (const item of all) {
        item.active = false;
        await this.nodes.put(node);
      }
    }
    const record = await this.nodes.where('node_address').equalsIgnoreCase(node.node_address).toArray();
    if (record.length > 0) {
      await this.nodes.put(node);
    } else {
      await this.nodes.add(node);
    }

    return node;
  }

  public delete(node: Node) {
    return this.nodes.delete(node.node_address);
  }

  public async hasAnyNode(): Promise<boolean> {
    return (await this.nodes.toArray()).length > 0;
  }

  public async getActiveNode(): Promise<Node | null> {
    let found: Node | null = null;
    const all = await this.nodes.toArray();
    for (const item of all) {
      if (item.active) {
        found = item;
        break;
      }
    }
    return found;
  }
}
