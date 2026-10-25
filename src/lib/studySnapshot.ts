import type { Message } from '../types/chat';
import type { UploadedImage } from './uploads';
import { MAX_STUDY_BYTES, studyBytes, type Study } from './studyData.ts';

async function readImage(url: string, apiBase: string): Promise<Blob> {
  const source = new URL(url, location.href);
  const allowed = new URL(apiBase || location.origin, location.href);
  if (source.origin !== allowed.origin || !/^\/artifacts\//.test(source.pathname)) throw new Error('asset_origin');
  const response = await fetch(source, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('asset_missing');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('asset_missing');
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) throw new Error('asset_size');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const blob = new Blob(chunks, { type: response.headers.get('content-type')?.split(';')[0] });
  if (!['image/png', 'image/jpeg'].includes(blob.type)) throw new Error('asset_type');
  return blob;
}

export async function snapshotStudy(message: Message, prompt: string, apiBase: string, input?: UploadedImage): Promise<Study> {
  if (!message.requestId || !message.analysisResults || !message.analysisQuality?.modules) throw new Error('missing_results');
  const filename = (message.analysisResults.image_provenance as { filename?: string } | undefined)?.filename;
  const study: Study = {
    id: message.requestId, title: message.objectName || filename || prompt.slice(0, 80) || message.requestId,
    createdAt: Date.now(), prompt, message: structuredClone(message), assets: [],
  };
  for (const [i, url] of [message.imageUrl, ...(message.analysisPlots ?? [])].entries()) {
    if (!url) continue;
    study.assets.push({ name: i === 0 ? 'image' : `plot-${i - 1}`, blob: await readImage(url, apiBase) });
    if (studyBytes(study) > MAX_STUDY_BYTES) throw new Error('study_size');
  }
  if (input) {
    const binary = atob(input.data.includes(',') ? input.data.split(',')[1] : input.data);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
    const provenance = message.analysisResults.image_provenance as { sha256?: string } | undefined;
    if (hash !== provenance?.sha256) throw new Error('original_mismatch');
    const options = Object.fromEntries(Object.entries(input).filter(([key]) => key !== 'data')) as Omit<UploadedImage, 'data'>;
    study.original = { filename: input.filename, blob: new Blob([bytes]), options };
  }
  if (studyBytes(study) > MAX_STUDY_BYTES) throw new Error('study_size');
  return study;
}

export function localStudyMessage(study: Study): { message: Message; revoke: () => void } {
  const urls = study.assets.map(asset => ({ name: asset.name, url: URL.createObjectURL(asset.blob) }));
  return {
    message: { ...study.message, requestId: undefined, hstJwst: undefined, suggestedActions: undefined,
      imageUrl: urls.find(asset => asset.name === 'image')?.url,
      analysisPlots: urls.filter(asset => asset.name.startsWith('plot-')).map(asset => asset.url) },
    revoke: () => urls.forEach(asset => URL.revokeObjectURL(asset.url)),
  };
}
