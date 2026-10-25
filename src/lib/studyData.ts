import type { Message } from '../types/chat';
import type { UploadedImage } from './uploads';

export interface StudyAsset { name: string; blob: Blob; }
export interface Study {
  id: string;
  title: string;
  createdAt: number;
  prompt: string;
  message: Message;
  assets: StudyAsset[];
  original?: { filename: string; blob: Blob; options: Omit<UploadedImage, 'data'> };
}

export interface StudyRow { section: string; parameter: string; value: string | number | boolean | null; }

export function resultRows(results: Record<string, unknown>): StudyRow[] {
  const rows: StudyRow[] = [];
  function visit(value: unknown, section: string, path: string, depth: number) {
    if (depth > 16 || rows.length > 30000) throw new Error('result_size');
    if (value == null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
      rows.push({ section, parameter: path, value: typeof value === 'number' && !Number.isFinite(value) ? null : value ?? null });
    } else if (Array.isArray(value)) {
      value.forEach((entry, i) => visit(entry, section, `${path}[${i}]`, depth + 1));
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([key, entry]) => visit(entry, section, path ? `${path}.${key}` : key, depth + 1));
    }
  }
  Object.entries(results).forEach(([key, value]) => visit(value, key, '', 0));
  return rows;
}

export function csvCell(value: StudyRow['value']): string {
  let text = value == null ? '' : String(value);
  // Spreadsheet formula protection applies to strings, never to negative numeric data.
  const formulaPrefix = [...text].filter(char => char.charCodeAt(0) > 31).join('').trimStart();
  if (typeof value === 'string' && /^[=+\-@]/.test(formulaPrefix)) text = "'" + text;
  return '"' + text.split('"').join('""') + '"';
}

export function studyCsv(studies: Study[]): string {
  const lines = [['study', 'request_id', 'section', 'parameter', 'value', 'value_type'].map(csvCell).join(',')];
  for (const study of studies) {
    const rows: StudyRow[] = [
      { section: 'study', parameter: 'created_at', value: new Date(study.createdAt).toISOString() },
      { section: 'study', parameter: 'prompt', value: study.prompt },
      { section: 'study', parameter: 'original_included', value: !!study.original },
      ...resultRows(study.message.analysisResults ?? {}),
      ...resultRows({ analysis_quality: study.message.analysisQuality ?? {} }),
    ];
    for (const row of rows) lines.push([study.title, study.message.requestId ?? '', row.section, row.parameter,
      row.value, row.value == null ? 'null' : typeof row.value].map(csvCell).join(','));
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename(filename);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function safeFilename(name: string): string {
  return [...name.replace(/^.*[\\/]/, '').replace(/[<>:"|?*]/g, '_')]
    .map(char => char.charCodeAt(0) < 32 ? '_' : char).join('').slice(0, 180) || 'astronomia';
}

export const MAX_STUDY_BYTES = 32 * 1024 * 1024;

export function studyBytes(study: Study): number {
  return new Blob([JSON.stringify({ ...study, original: study.original ? { filename: study.original.filename, options: study.original.options } : undefined, assets: [] })]).size
    + study.assets.reduce((sum, asset) => sum + asset.blob.size, 0) + (study.original?.blob.size ?? 0);
}
