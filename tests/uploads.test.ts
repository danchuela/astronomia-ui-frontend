import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateUpload, isFits, MAX_UPLOAD_BYTES } from '../src/lib/uploads.ts';

test('accepts supported astronomical images within the byte limit', () => {
  for (const name of ['a.png', 'a.JPG', 'a.jpeg', 'a.tiff', 'a.tif', 'a.fits', 'a.fit', 'a.fts']) {
    assert.equal(validateUpload({ name, size: 100 }), null);
  }
  assert.equal(validateUpload({ name: 'a.png', size: MAX_UPLOAD_BYTES }), null);
});

test('rejects zero bytes, large files, unsupported content and long names', () => {
  assert.equal(validateUpload({ name: 'a.png', size: 0 }), 'size');
  assert.equal(validateUpload({ name: 'a.png', size: MAX_UPLOAD_BYTES + 1 }), 'size');
  for (const name of ['a.svg', 'a.pdf', 'a.fits.gz', 'a.png.exe', 'x'.repeat(181) + '.png']) {
    assert.equal(validateUpload({ name, size: 100 }), 'format');
  }
});

test('only FITS files expose a plane selector', () => {
  assert.equal(isFits('M101.FITS'), true);
  assert.equal(isFits('image.fit'), true);
  assert.equal(isFits('image.png'), false);
});
