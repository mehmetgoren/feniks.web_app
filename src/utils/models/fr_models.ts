export interface FrTrainViewModel {
  name: string;
  image_paths: string[];
}

export interface FaceTrainResponseEvent {
  result: boolean;
}

export interface FrTrainScreenshotViewModel {
  name: string;
  base64_image: string;
}

export interface FrTrainRename{
  new_name: string;
  original_name: string;
}

export interface FrTrainName{
  name: string;
}