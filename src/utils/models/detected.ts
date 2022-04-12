export interface FolderTreeItem{
  fullPath: string;
  label:string;
  size:number;
  modifiedAt:string;
  children: FolderTreeItem[];
}

export interface ImageItem{
  id:string;
  imagePath: string;
}

export interface OdImagesParams{
  rootPath: string;
  sourceId: string;
}
