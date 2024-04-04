export interface FaceTrainViewModel {
  name: string;
  image_paths: string[];
}

export interface FaceTrainResponseEvent {
  result: boolean;
}

export interface FaceTrainScreenshotViewModel {
  name: string;
  base64_images: string[];
}

export interface FaceTrainRename{
  new_name: string;
  original_name: string;
}

export interface FaceTrainName {
  name: string;
}
