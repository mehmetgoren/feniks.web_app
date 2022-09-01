export interface FolderTreeItem{
  fullPath: string;
  label:string;
  size:number;
  modifiedAt:string;
  children: FolderTreeItem[];
  iconColor:string;
}

export interface ImageItem{
  id:string;
  imagePath: string;
}

export interface ImagesParams{
  rootPath: string;
  sourceId: string;
  ai_type:number;
}
