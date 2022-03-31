export interface FolderTreeItem{
  fullPath: string;
  label:string;
  size:number;
  modifiedAt:string;
  children: FolderTreeItem[];
}

export interface ImageItem{
  fullPath: string;
  sourceId: string;
  className: string;
  score: number;
  modifiedAt: string;
  id:string;
  imagePath: string;
}

export interface DetectedImagesParams{
  rootPath: string;
  sourceId: string;
}
