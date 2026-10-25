export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.tif,.tiff,.fits,.fit,.fts';

export interface UploadedImage {
  filename: string;
  data: string;
  hdu_index?: number;
}

export function isFits(filename: string): boolean {
  return /\.(fits|fit|fts)$/i.test(filename);
}

export function validateUpload(file: Pick<File, 'name' | 'size'>): 'format' | 'size' | null {
  if (!/\.(png|jpe?g|tiff?|fits|fit|fts)$/i.test(file.name) || file.name.length > 180) return 'format';
  if (!file.size || file.size > MAX_UPLOAD_BYTES) return 'size';
  return null;
}

export function readUpload(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => resolve({ filename: file.name, data: String(reader.result) });
    reader.readAsDataURL(file);
  });
}
