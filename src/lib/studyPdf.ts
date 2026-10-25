import { jsPDF } from 'jspdf';
import { resultRows, safeFilename, type Study } from './studyData.ts';
import { STUDY_TEXTS } from './studyTexts.ts';
import type { Lang } from './i18n';

const clean = (text: string) => [...text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')]
  .filter(char => char === '\n' || char === '\t' || char.charCodeAt(0) >= 32).join('');

export async function studyPdf(study: Study, lang: Lang): Promise<Blob> {
  const t = STUDY_TEXTS[lang];
  const fontResponse = await fetch(`${import.meta.env.BASE_URL}fonts/DejaVuSans.ttf`);
  if (!fontResponse.ok) throw new Error('pdf_font');
  const bytes = new Uint8Array(await fontResponse.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.addFileToVFS('DejaVuSans.ttf', btoa(binary));
  doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
  doc.setFont('DejaVu');
  doc.setProperties({ title: safeFilename(study.title), author: 'astronomIA', subject: study.message.requestId ?? '' });
  let y = 20;
  const width = 174;
  const page = () => { doc.addPage(); y = 20; };
  const space = (height: number) => { if (y + height > 275) page(); };
  const text = (value: string, size = 9, gap = 4.6) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(clean(value), width) as string[];
    for (const line of lines) { space(gap); doc.text(line, 18, y); y += gap; }
    y += 3;
  };
  const heading = (value: string) => { space(18); y += 4; doc.setTextColor(76, 42, 128); text(value, 12, 6); doc.setTextColor(30, 35, 44); };
  doc.setTextColor(76, 42, 128);
  text('astronomIA', 19, 9);
  doc.setTextColor(30, 35, 44);
  text(study.title, 15, 7);
  text(`${t.date}: ${new Date(study.createdAt).toLocaleString(lang)}\n${t.request}: ${study.message.requestId ?? '-'}`, 8);
  text(study.original ? t.includedOriginal : t.missingOriginal, 8);
  heading(t.prompt);
  text(study.prompt);
  heading(t.quality);
  text(t.limits);
  for (const row of resultRows({ quality: study.message.analysisQuality ?? {} })) {
    text(`${row.parameter}: ${row.value == null ? '-' : String(row.value)}`, 8, 4);
  }
  heading(t.results);
  const measurements = study.message.analysisResults?.measurements;
  const rows = measurements && typeof measurements === 'object' ? resultRows({ measurements }) : [];
  if (!rows.length) text(t.noValues);
  for (const row of rows) {
    const value = typeof row.value === 'number' ? row.value.toPrecision(9) : row.value == null ? '-' : String(row.value);
    text(`${row.parameter}: ${value}`, 8, 4);
  }
  heading(t.provenance);
  const source = study.message.analysisResults ?? {};
  const provenance = resultRows(Object.fromEntries(['image_provenance', 'analysis_parameters', 'segmentation_metadata', 'provenance']
    .filter(key => source[key] != null).map(key => [key, source[key]])));
  for (const row of provenance) text(`${row.section}.${row.parameter}: ${row.value == null ? '-' : String(row.value)}`, 7, 3.8);
  heading('astronomIA');
  text(study.message.content);
  for (const asset of study.assets) {
    const imageBytes = new Uint8Array(await asset.blob.arrayBuffer());
    const dimensions = doc.getImageProperties(imageBytes);
    const imageWidth = Math.min(width, dimensions.width * 0.2646);
    const imageHeight = imageWidth * dimensions.height / dimensions.width;
    if (y + Math.min(imageHeight, 224) + 16 > 275) page();
    heading(asset.name === 'image' ? t.preview : `${t.plot} ${Number(asset.name.replace('plot-', '')) + 1}`);
    const scale = Math.min(1, 225 / imageHeight);
    doc.addImage(imageBytes, asset.blob.type === 'image/jpeg' ? 'JPEG' : 'PNG', 18, y, imageWidth * scale, imageHeight * scale);
    y += imageHeight * scale + 6;
  }
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(90, 95, 104);
    doc.text('astronomIA', 18, 287); doc.text(`${i} / ${pages}`, 192, 287, { align: 'right' });
  }
  return doc.output('blob');
}
