export interface Asset {
  type: 'image' | 'video' | 'file' | 'voice';
  url: string;
  name: string;
  size: number;
}

export type Image = Omit<Asset, 'type'>;
