import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, resultRows, safeFilename, studyBytes, studyCsv, type Study } from '../src/lib/studyData.ts';

const study = (): Study => ({
  id: 'study-1', title: 'M81', createdAt: Date.UTC(2026, 9, 25), prompt: 'Analiza la galaxia', assets: [],
  message: { id: 'message-1', role: 'assistant', content: 'Resultado', requestId: 'request-1',
    analysisResults: { measurements: { asymmetry: -0.01561802246991499, smoothness: null, area: 0 },
      image_provenance: { source: 'upload', calibrated: false, sha256: 'abcd' },
      modules: { cas: { status: 'suspect' } }, radial_profile: { radius: [1, 2], intensity: [0, -4] } },
    analysisQuality: { status: 'exploratory', modules: { cas: 'suspect' } } },
});

test('CSV retains full numeric precision and negative values without formula escaping', () => {
  const csv = studyCsv([study()]);
  assert.ok(csv.includes('"-0.01561802246991499","number"'));
  assert.ok(!csv.includes("'-0.015618"));
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.endsWith('\r\n'));
});
test('CSV distinguishes missing values, zero and false', () => {
  const csv = studyCsv([study()]);
  assert.ok(csv.includes('"smoothness","","null"'));
  assert.ok(csv.includes('"area","0","number"'));
  assert.ok(csv.includes('"calibrated","false","boolean"'));
});
test('CSV includes provenance, module status and indexed arrays', () => {
  const csv = studyCsv([study()]);
  for (const value of ['abcd', 'suspect', 'radius[0]', 'intensity[1]', 'request-1', 'original_included']) assert.ok(csv.includes(value));
});
test('spreadsheet formulas in string fields are escaped, including whitespace prefixes', () => {
  for (const text of ['=CMD()', '+123', '-123', '@SUM(A1)', '\t =1+1', '\r\n@X']) assert.equal(csvCell(text), `"'${text}"`);
  assert.equal(csvCell(-123), '"-123"');
});
test('CSV correctly quotes commas, Unicode, quotes and newlines', () => {
  assert.equal(csvCell('Sérsic, "σ"\nMadrid'), '"Sérsic, ""σ""\nMadrid"');
});
test('comparison CSV preserves study identity for both sets of measurements', () => {
  const second = study(); second.id = 'study-2'; second.title = 'M51'; second.message.requestId = 'request-2';
  const csv = studyCsv([study(), second]);
  assert.ok(csv.includes('"M81","request-1"'));
  assert.ok(csv.includes('"M51","request-2"'));
});
test('nonfinite measurements remain unavailable, not zero', () => {
  assert.deepEqual(resultRows({ values: { a: NaN, b: Infinity, c: -Infinity } }).map(row => row.value), [null, null, null]);
});
test('recursive results are bounded', () => {
  let nested: Record<string, unknown> = { value: 1 };
  for (let i = 0; i < 20; i++) nested = { nested };
  assert.throws(() => resultRows(nested), /result_size/);
});
test('download names cannot contain paths or control characters', () => {
  assert.equal(safeFilename('../../galaxy.fits'), 'galaxy.fits');
  assert.equal(safeFilename('C:\\test\\M81?.pdf'), 'M81_.pdf');
  assert.ok(!safeFilename('a\u0000b').includes('\u0000'));
  assert.ok(safeFilename('x'.repeat(500)).length <= 180);
});
test('study quotas account for binary assets and the original without serializing the bytes', () => {
  const first = study(); const before = studyBytes(first);
  first.assets.push({ name: 'image', blob: new Blob([new Uint8Array(1024)]) });
  assert.equal(studyBytes(first) - before, 1024);
  first.original = { filename: 'galaxy.fits', blob: new Blob([new Uint8Array(4096)]), options: { filename: 'galaxy.fits' } };
  assert.ok(studyBytes(first) >= before + 5120);
});
