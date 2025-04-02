declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
      fileName?: string;
      fileSize?: number;
    }>;
  }

  export interface ImagePickerOptions {
    mediaTypes: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export enum MediaTypeOptions {
    All = 'All',
    Videos = 'Videos',
    Images = 'Images',
  }

  export function launchImageLibraryAsync(options: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options: ImagePickerOptions): Promise<ImagePickerResult>;
} 