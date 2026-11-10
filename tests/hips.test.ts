import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HipsTileTracker, visibleTileUrls, type HipsMetadata } from '../src/lib/hips.ts';

const metadata: HipsMetadata = {
  id: 'CDS/P/SDSS9/color', release: '2019-05-05T06:57Z', frame: 'equatorial',
  max_order: 10, tile_width: 512, formats: ['jpeg'], revision: 'a'.repeat(20),
  path: '/hips/' + 'a'.repeat(20) + '/CDS/P/SDSS9/color', provider: 'https://test.example/sdss',
};
const root = 'https://bff.test' + metadata.path;
const urls = [root + '/Norder7/Dir10000/Npix10836.jpg', root + '/Norder7/Dir10000/Npix10837.jpg'];

test('expected tiles come from the actual Aladin HEALPix engine and are capped at survey resolution', () => {
  let depth = 0;
  const engine = { getNOrder: () => 15, isRendering: () => false,
    getVisibleCells: (order: number) => { depth = order; return [{ ipix: 10836 }, { ipix: 10837 }]; } };
  assert.deepEqual(visibleTileUrls(engine, metadata, root), urls.map(u => u.replace('Norder7', 'Norder10')));
  assert.equal(depth, 10);
  engine.getNOrder = () => 2;
  assert.deepEqual(visibleTileUrls(engine, metadata, root), [root + '/Norder3/Allsky.jpg']);
});

test('one loaded tile or an allsky image does not mark a detailed field ready', () => {
  const tracker = new HipsTileTracker(root);
  tracker.observe({ name: root + '/Norder3/Allsky.jpg', responseStatus: 200 });
  assert.equal(tracker.state(urls), 'loading');
  tracker.observe({ name: urls[0], responseStatus: 200 });
  assert.equal(tracker.state(urls), 'loading');
  tracker.observe({ name: urls[1], responseStatus: 200 });
  assert.equal(tracker.state(urls), 'ready');
  tracker.dispose();
});

test('failed partial downloads cannot be captured as a complete field', () => {
  const tracker = new HipsTileTracker(root);
  tracker.observe({ name: urls[0], responseStatus: 200 });
  tracker.observe({ name: urls[1], responseStatus: 503 });
  assert.equal(tracker.state(urls), 'failed');
  tracker.observe({ name: urls[1], responseStatus: 200 });
  assert.equal(tracker.state(urls), 'ready');
  tracker.dispose();
});

test('no coverage is distinct from a network failure', () => {
  const tracker = new HipsTileTracker(root);
  for (const url of urls) tracker.observe({ name: url, responseStatus: 404 });
  assert.equal(tracker.state(urls), 'no_coverage');
  tracker.dispose();
});

test('tiles Aladin never requested (outside the coverage map) are probed: 404 means no coverage', async () => {
  const asked: string[] = [];
  const tracker = new HipsTileTracker(root, async url => { asked.push(url); return { status: 404, length: 0 }; });
  tracker.probeMissing(urls);
  tracker.probeMissing(urls);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(asked, urls);
  assert.equal(tracker.state(urls), 'no_coverage');
  tracker.dispose();
});

test('a probe never marks a field ready or failed: only Aladin downloads do', async () => {
  const tracker = new HipsTileTracker(root, async url => ({ status: url === urls[0] ? 200 : 503, length: 9 }));
  tracker.probeMissing(urls);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(tracker.state(urls), 'loading');
  tracker.dispose();
});

test('different revisions and surveys cannot satisfy readiness', () => {
  const tracker = new HipsTileTracker(root);
  for (const url of urls) tracker.observe({ name: url.replace('a'.repeat(20), 'b'.repeat(20)), responseStatus: 200 });
  assert.equal(tracker.state(urls), 'loading');
  tracker.dispose();
});

test('browsers without responseStatus verify the completed body, not merely a 200 header', async () => {
  const tracker = new HipsTileTracker(root, async () => ({ status: 200, length: 120 }));
  tracker.observe({ name: urls[0], decodedBodySize: 120 });
  tracker.observe({ name: urls[1], decodedBodySize: 20 });
  assert.equal(tracker.state(urls), 'loading');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(tracker.state(urls), 'failed');
  tracker.dispose();
});

test('server timing supplies status without duplicating requests on compatible browsers', () => {
  const tracker = new HipsTileTracker(root, async () => { throw new Error('not needed'); });
  for (const url of urls) tracker.observe({ name: url, serverTiming: [{ name: 'hips', description: '200' }] });
  assert.equal(tracker.state(urls), 'ready');
  tracker.dispose();
});

test('switching or closing the survey aborts outstanding legacy-browser checks', async () => {
  let aborted = false;
  const tracker = new HipsTileTracker(root, async (_, signal) => {
    await new Promise<void>(resolve => signal.addEventListener('abort', () => { aborted = true; resolve(); }, { once: true }));
    return { status: 200, length: 120 };
  });
  tracker.observe({ name: urls[0], decodedBodySize: 120 });
  tracker.dispose();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(aborted, true);
  assert.equal(tracker.state(urls), 'loading');
});

test('retry is not poisoned by failure entries from an earlier attempt', () => {
  const tracker = new HipsTileTracker(root);
  tracker.observe({ name: urls[0], responseStatus: 503, startTime: -1 });
  assert.equal(tracker.state(urls), 'loading');
  tracker.dispose();
});
