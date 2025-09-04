export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}

export interface EditHistory {
  id: string;
  operation: string;
  uri: string;
  timestamp: number;
}

export type ActiveTab = 'resize' | 'crop' | 'convert';
export type ResizeMode = 'pixels' | 'percent';
export type CropMode = 'rectangle' | 'circle';
export type ImageFormat = 'png' | 'jpeg';
