import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { deleteStudy, listStudies, saveStudy } from '../src/lib/studyStorage.ts';
import type { Study } from '../src/lib/studyData.ts';

beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });
const make = (id = 'study-1'): Study => ({ id, title: 'M81', createdAt: Date.now(), prompt: 'Analiza M81', assets: [],
  message: { id: 'message-1', role: 'assistant', content: 'Resumen', analysisResults: { measurements: { concentration: 3.25 } } } });

test('saving waits for commit and returns an isolated snapshot', async () => {
  const original = make(); await saveStudy(original);
  original.title = 'Changed';
  const stored = await listStudies();
  assert.equal(stored.length, 1); assert.equal(stored[0].title, 'M81');
  assert.equal((stored[0].message.analysisResults!.measurements as Record<string, number>).concentration, 3.25);
});
test('binary previews and the original survive a close and reopen', async () => {
  const original = make();
  original.assets.push({ name: 'image', blob: new Blob(['preview'], { type: 'image/png' }) });
  original.original = { filename: 'source.fits', blob: new Blob(['original\u0000bytes']), options: { filename: 'source.fits', hdu_index: 2 } };
  await saveStudy(original);
  const [stored] = await listStudies();
  assert.equal(await stored.assets[0].blob.text(), 'preview');
  assert.equal(await stored.original!.blob.text(), 'original\u0000bytes');
  assert.equal(stored.original!.options.hdu_index, 2);
});
test('renaming updates the existing record without duplicates or lost binaries', async () => {
  const original = make(); original.assets.push({ name: 'image', blob: new Blob(['pixels']) });
  await saveStudy(original); await saveStudy({ ...original, title: 'Nuevo nombre' });
  const stored = await listStudies();
  assert.equal(stored.length, 1); assert.equal(stored[0].title, 'Nuevo nombre');
  assert.equal(await stored[0].assets[0].blob.text(), 'pixels');
});
test('deletion does not affect other studies', async () => {
  await saveStudy(make('one')); await saveStudy(make('two')); await deleteStudy('one');
  assert.deepEqual((await listStudies()).map(study => study.id), ['two']);
});
test('study count quota rejects atomically and permits overwriting an existing study', async () => {
  for (let i = 0; i < 50; i++) await saveStudy(make(String(i)));
  await assert.rejects(saveStudy(make('overflow')), /study_quota/);
  assert.equal((await listStudies()).length, 50);
  await saveStudy({ ...make('0'), title: 'Updated' });
  assert.equal((await listStudies()).find(study => study.id === '0')?.title, 'Updated');
});
test('per-study size quota does not create a partial record', async () => {
  const original = make(); original.assets.push({ name: 'image', blob: new Blob([new Uint8Array(33 * 1024 * 1024)]) });
  await assert.rejects(saveStudy(original), /study_size/);
  assert.equal((await listStudies()).length, 0);
});
test('total size quota preserves existing studies and frees capacity after deletion', async () => {
  const blob = new Blob([new Uint8Array(31 * 1024 * 1024)]);
  for (let i = 0; i < 4; i++) { const original = make(String(i)); original.assets.push({ name: 'image', blob }); await saveStudy(original); }
  const extra = make('extra'); extra.assets.push({ name: 'image', blob });
  await assert.rejects(saveStudy(extra), /study_quota/);
  assert.equal((await listStudies()).length, 4);
  await deleteStudy('0'); await saveStudy(extra);
  assert.equal((await listStudies()).length, 4);
});
