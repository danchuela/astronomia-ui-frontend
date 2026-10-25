export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.tif,.tiff,.fits,.fit,.fts';

export interface UploadedImage {
  filename: string;
  data: string;
  hdu_index?: number;
  psf_hdu_index?: number;
  error_hdu_index?: number;
  error_kind?: 'sigma' | 'variance' | 'inverse_variance';
  source_point?: { x: number; y: number };
  region?: { left: number; top: number; right: number; bottom: number };
  uncertainty_samples?: 0 | 16;
}

export interface ImageInspection {
  width: number;
  height: number;
  preview: string;
  sha256: string;
  sources: { label: number; x: number; y: number; area: number; automatic: boolean }[];
  hdus: { index: number; name: string; width: number; height: number }[];
}

export async function inspectUpload(upload: UploadedImage, signal?: AbortSignal): Promise<ImageInspection> {
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const response = await fetch(`${base}/images/inspect`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({ ...upload, source_point: undefined, region: undefined, uncertainty_samples: 0 }),
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
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
