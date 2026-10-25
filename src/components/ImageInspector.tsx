import { useEffect, useRef, useState } from 'react';
import { Crosshair, Crop, RotateCcw, X, LoaderCircle, RefreshCw, Check } from 'lucide-react';
import { inspectUpload, isFits, withScienceHdu, type UploadedImage, type ImageInspection } from '@/lib/uploads';
import { useLang } from '@/lib/i18n';

interface Props { image: UploadedImage; onApply: (image: UploadedImage) => void; onClose: () => void }

export function ImageInspector({ image, onApply, onClose }: Props) {
  const { t } = useLang();
  const labels = t.imageTools;
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(image);
  const [inspection, setInspection] = useState<ImageInspection>();
  const [inspectedHdu, setInspectedHdu] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'point' | 'region'>('point');
  const start = useRef<{ x: number; y: number }>();
  const request = useRef<AbortController>();

  const refresh = async (upload: UploadedImage) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError('');
    try {
      const result = await inspectUpload(upload, controller.signal);
      if (!controller.signal.aborted) {
        setInspection(result); setInspectedHdu(upload.hdu_index);
        if (Math.max(result.width, result.height) > 512) setDraft(current => ({ ...current, uncertainty_samples: 0 }));
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error && e.message === '503' ? labels.busy : e instanceof Error && e.message === 'resource_limit' ? labels.resourceLimit : labels.failed);
    } finally { if (!controller.signal.aborted) setLoading(false); }
  };
  useEffect(() => {
    dialog.current?.showModal();
    const pending = window.setTimeout(() => { void refresh(image); }, 0);
    return () => { window.clearTimeout(pending); request.current?.abort(); };
    // The modal owns an immutable input until Apply; edits are kept in draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const position = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  const hduInput = (key: 'hdu_index' | 'psf_hdu_index' | 'error_hdu_index', label: string) => (
    <label className="flex min-w-0 items-center justify-between gap-2 text-sm">
      <span>{label}</span>
      <input type="number" min="0" max="63" step="1" placeholder={key === 'hdu_index' ? 'Auto' : '—'}
        aria-label={label} disabled={loading} value={draft[key] ?? ''}
        onChange={e => { const value = e.target.value === '' ? undefined : Number(e.target.value);
          if (value === undefined || (Number.isInteger(value) && value >= 0 && value <= 63))
            setDraft(current => key === 'hdu_index' ? withScienceHdu(current, value) : { ...current, [key]: value }); }}
        className="w-20 shrink-0 rounded border border-input bg-background p-2" />
    </label>
  );
  const ready = inspection && inspectedHdu === draft.hdu_index && !loading && !error;
  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="image-tools-title"
      className="m-auto w-[min(1100px,96vw)] max-h-[94dvh] overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground backdrop:bg-black/75">
      <header className="sticky top-0 z-10 bg-background flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id="image-tools-title" className="text-lg font-semibold">{labels.title}</h2>
        <button type="button" onClick={onClose} title={t.close} aria-label={t.close} className="p-2 hover:bg-muted rounded"><X size={20} /></button>
      </header>
      <div className="grid md:grid-cols-[250px_minmax(0,1fr)]">
        <section className="order-2 md:order-none space-y-4 border-b md:border-b-0 md:border-r border-border p-4">
          <p className="break-all text-xs text-muted-foreground">{draft.filename}</p>
          {isFits(draft.filename) && <div className="space-y-3">
            {hduInput('hdu_index', labels.scienceHdu)}
            {hduInput('psf_hdu_index', labels.psfHdu)}
            {hduInput('error_hdu_index', labels.errorHdu)}
            <select aria-label={labels.errorKind} disabled={loading || draft.error_hdu_index === undefined}
              value={draft.error_kind ?? 'sigma'} onChange={e => setDraft({ ...draft, error_kind: e.target.value as UploadedImage['error_kind'] })}
              className="w-full rounded border border-input bg-background p-2 text-sm">
              <option value="sigma">{labels.sigma}</option><option value="variance">{labels.variance}</option><option value="inverse_variance">{labels.inverseVariance}</option>
            </select>
            {inspection?.hdus.map(hdu => <p key={hdu.index} className="text-xs text-muted-foreground break-words">HDU {hdu.index}: {hdu.name} · {hdu.width} × {hdu.height}</p>)}
          </div>}
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-violet-500" checked={!!draft.uncertainty_samples}
            disabled={loading || !!inspection && Math.max(inspection.width, inspection.height) > 512}
            onChange={e => setDraft({ ...draft, uncertainty_samples: e.target.checked ? 16 : 0 })} />{labels.stability}</label>
          <select className="w-full rounded border border-input bg-background p-2 text-sm" aria-label={labels.source} disabled={!ready}
            value={draft.source_point ? '' : 'auto'} onChange={e => {
              const source = inspection?.sources.find(s => String(s.label) === e.target.value);
              setDraft({ ...draft, source_point: source && inspection ? { x: source.x / (inspection.width - 1), y: source.y / (inspection.height - 1) } : undefined });
            }}>
            <option value="auto">{labels.automatic}</option><option value="" disabled>{labels.selected}</option>
            {inspection?.sources.map(s => <option key={s.label} value={s.label}>{labels.source} {s.label} · {s.area} px</option>)}
          </select>
          <div className="flex gap-2">
            {([{ value: 'point', label: labels.point, Icon: Crosshair }, { value: 'region', label: labels.region, Icon: Crop }] as const).map(({ value, label, Icon }) =>
              <button key={value} type="button" title={label} aria-label={label} aria-pressed={mode === value} onClick={() => setMode(value)} className={`p-2 rounded border ${mode === value ? 'border-primary bg-primary/20' : 'border-border'}`}><Icon size={20} /></button>)}
            <button type="button" title={labels.reset} aria-label={labels.reset} onClick={() => setDraft({ ...draft, source_point: undefined, region: undefined })} className="p-2 rounded border border-border"><RotateCcw size={20} /></button>
            <button type="button" title={labels.refresh} aria-label={labels.refresh} disabled={loading} onClick={() => void refresh(draft)} className="p-2 rounded border border-border disabled:opacity-50"><RefreshCw size={20} /></button>
          </div>
          {inspection && <p className="text-xs text-muted-foreground">{inspection.width} × {inspection.height} px · {inspection.sources.length} {labels.detections}</p>}
          {inspection?.detection_status === 'resource_limit' && <p role="status" className="text-sm text-amber-300">{labels.resourceLimit}</p>}
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        </section>
        <div className="order-1 md:order-none min-w-0 flex items-center justify-center bg-black/30 p-3 min-h-56">
          {loading ? <LoaderCircle className="animate-spin" size={28} aria-label={labels.loading} /> : inspection && <div className="relative inline-block max-w-full leading-none touch-none select-none"
            style={{ width: `min(100%, ${58 * inspection.width / inspection.height}dvh)` }}
            onPointerDown={e => { if (!ready) return; const p = position(e); if (mode === 'point') setDraft({ ...draft, source_point: p });
              else { start.current = p; e.currentTarget.setPointerCapture(e.pointerId); } }}
            onPointerMove={e => { if (!start.current || mode !== 'region') return; const p = position(e), a = start.current;
              if (Math.abs(p.x - a.x) > .005 && Math.abs(p.y - a.y) > .005) setDraft({ ...draft, region: { left: Math.min(a.x, p.x), top: Math.min(a.y, p.y), right: Math.max(a.x, p.x), bottom: Math.max(a.y, p.y) } }); }}
            onPointerUp={() => { start.current = undefined; }} onPointerCancel={() => { start.current = undefined; }}>
            <img src={inspection.preview} alt={labels.preview} draggable={false} className="block w-full h-auto" />
            {draft.region && <div className="absolute border-2 border-cyan-300 bg-cyan-300/5 pointer-events-none" style={{ left: `${draft.region.left * 100}%`, top: `${draft.region.top * 100}%`, width: `${(draft.region.right - draft.region.left) * 100}%`, height: `${(draft.region.bottom - draft.region.top) * 100}%` }} />}
            {draft.source_point && <Crosshair size={24} className="absolute text-amber-300 pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ left: `${draft.source_point.x * 100}%`, top: `${draft.source_point.y * 100}%` }} />}
          </div>}
        </div>
      </div>
      <footer className="sticky bottom-0 bg-background flex justify-end gap-3 border-t border-border p-3">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm">{t.close}</button>
        <button type="button" disabled={!ready} onClick={() => { onApply(draft); onClose(); }} className="flex items-center gap-2 rounded bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"><Check size={16} />{labels.apply}</button>
      </footer>
    </dialog>
  );
}
