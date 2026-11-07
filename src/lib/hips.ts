export interface HipsMetadata {
  id: string;
  release: string;
  frame: string;
  max_order: number;
  tile_width: number;
  formats: string[];
  revision: string;
  path: string;
  provider: string;
}

export async function fetchHipsMetadata(base: string, id: string, signal: AbortSignal): Promise<HipsMetadata> {
  const response = await fetch(`${base}/hips/metadata?survey_id=${encodeURIComponent(id)}`, { signal });
  if (!response.ok) throw new Error('hips_unavailable');
  const value = await response.json() as HipsMetadata;
  if (value.id !== id || !/^[a-f0-9]{20}$/.test(value.revision)
    || value.path !== `/hips/${value.revision}/${id}`
    || !Number.isInteger(value.max_order) || value.max_order < 0 || value.max_order > 14
    || ![256, 512, 1024].includes(value.tile_width)
    || !['equatorial', 'galactic', 'ecliptic'].includes(value.frame)
    || !Array.isArray(value.formats) || !value.formats.some(f => ['jpeg', 'png'].includes(f))
    || typeof value.release !== 'string' || !/^https:\/\//.test(value.provider)) {
    throw new Error('hips_invalid_metadata');
  }
  return value;
}

export function tileFormat(metadata: HipsMetadata): 'jpeg' | 'png' {
  return metadata.formats.includes('jpeg') ? 'jpeg' : 'png';
}

export interface HipsEngine {
  getNOrder(): number;
  getVisibleCells(order: number): { ipix: number }[];
  isRendering(): boolean;
}

export function visibleTileUrls(engine: HipsEngine, metadata: HipsMetadata, root: string): string[] {
  const order = Math.min(metadata.max_order, engine.getNOrder());
  if (!Number.isInteger(order) || order < 0) return [];
  const extension = tileFormat(metadata) === 'jpeg' ? 'jpg' : 'png';
  if (order <= 3) return [`${root}/Norder3/Allsky.${extension}`];
  const cells = engine.getVisibleCells(order);
  if (!cells.length || cells.length > 512) return [];
  if (!cells.every(c => Number.isInteger(c.ipix) && c.ipix >= 0 && c.ipix < 12 * 4 ** order)) return [];
  return cells.map(({ ipix }) => `${root}/Norder${order}/Dir${Math.floor(ipix / 10000) * 10000}/Npix${ipix}.${extension}`);
}

interface ResourceEntry {
  name: string;
  responseStatus?: number;
  decodedBodySize?: number;
  serverTiming?: readonly { name: string; description: string }[];
  startTime?: number;
}
type Verify = (url: string, signal: AbortSignal) => Promise<{ status: number; length: number }>;
export type HipsLoadState = 'loading' | 'ready' | 'failed' | 'no_coverage';

// Resource timing reports completed downloads, not just response headers. For
// browsers without responseStatus, HEAD checks the same versioned, validated file.
export class HipsTileTracker {
  private statuses = new Map<string, number>();
  private verifying = new Set<string>();
  private controller = new AbortController();
  private bornAt = performance.now();
  private root: string;
  private verify: Verify;

  constructor(root: string, verify: Verify = async (url, signal) => {
    const response = await fetch(`${url}?verify=1`, { method: 'HEAD', signal });
    return { status: response.status, length: Number(response.headers.get('content-length')) };
  }) { this.root = root; this.verify = verify; }

  observe(entry: ResourceEntry): void {
    if (this.controller.signal.aborted || !entry.name.startsWith(`${this.root}/Norder`)
      || new URL(entry.name).search || this.verifying.has(entry.name)) return;
    const reported = entry.responseStatus || Number(entry.serverTiming?.find(t => t.name === 'hips')?.description);
    if (reported && reported !== 200 && reported !== 404 && (entry.startTime ?? Infinity) < this.bornAt) return;
    if (reported) {
      this.record(entry.name, reported);
    } else {
      this.verifying.add(entry.name);
      const request = new AbortController();
      const abort = () => request.abort();
      this.controller.signal.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(() => { request.abort(); this.record(entry.name, 503); }, 6000);
      void this.verify(entry.name, request.signal).then(result => {
        if (!this.controller.signal.aborted) {
          const valid = result.status === 404 || (result.status === 200 && result.length > 0
            && result.length === entry.decodedBodySize);
          this.record(entry.name, valid ? result.status : 503);
        }
      }).catch(() => {
        if (!this.controller.signal.aborted) this.record(entry.name, 503);
      }).finally(() => {
        clearTimeout(timer); this.verifying.delete(entry.name);
        this.controller.signal.removeEventListener('abort', abort);
      });
    }
  }

  private record(url: string, status: number): void {
    if (this.controller.signal.aborted) return;
    this.statuses.delete(url);
    this.statuses.set(url, status);
    if (this.statuses.size > 4096) this.statuses.delete(this.statuses.keys().next().value!);
  }

  state(urls: string[]): HipsLoadState {
    if (!urls.length) return 'loading';
    const statuses = urls.map(url => this.statuses.get(url));
    if (statuses.some(s => s !== undefined && s !== 200 && s !== 404)) return 'failed';
    if (statuses.some(s => s === undefined)) return 'loading';
    return statuses.some(s => s === 200) ? 'ready' : 'no_coverage';
  }

  dispose(): void { this.controller.abort(); this.statuses.clear(); }
}
