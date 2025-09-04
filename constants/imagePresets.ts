export interface ImagePreset {
  name: string;
  width: number;
  height: number;
}

export interface CropRatio {
  name: string;
  ratio: number | null;
}

export const socialPresets: ImagePreset[] = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 1200, height: 630 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Twitter Header', width: 1500, height: 500 },
];

export const commonResolutions: ImagePreset[] = [
  { name: 'HD', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'Square HD', width: 1080, height: 1080 },
  { name: 'Portrait HD', width: 1080, height: 1920 },
];

export const cropRatios: CropRatio[] = [
  { name: 'Free', ratio: null },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4/3 },
  { name: '16:9', ratio: 16/9 },
  { name: '3:2', ratio: 3/2 },
  { name: '9:16', ratio: 9/16 },
];
