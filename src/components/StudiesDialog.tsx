import { useEffect, useRef, useState } from 'react';
import { Archive, Check, Download, FileSpreadsheet, FileText, LoaderCircle, Pencil, Search, Trash2, X } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { listStudies, saveStudy, deleteStudy } from '@/lib/studyStorage';
import { downloadBlob, resultRows, studyCsv, type Study } from '@/lib/studyData';
import { localStudyMessage } from '@/lib/studySnapshot';
import { ChatMessage } from './ChatMessage';
import type { Message } from '@/types/chat';

function StudyPreview({ study }: { study: Study }) {
  const [message, setMessage] = useState<Message>();
  useEffect(() => {
    const local = localStudyMessage(study);
    setMessage(local.message);
    return local.revoke;
  }, [study]);
  return message ? <ChatMessage message={message} readOnly /> : <LoaderCircle role="status" className="h-5 w-5 animate-spin" />;
}

function Comparison({ studies }: { studies: Study[] }) {
  const { t } = useLang();
  const measurements = studies.map(study => new Map(resultRows({ measurements: study.message.analysisResults?.measurements ?? {} })
    .map(row => [row.parameter, row.value])));
  const parameters = [...new Set(measurements.flatMap(rows => [...rows.keys()]))];
  return <>
    <h2 className="mb-3 text-lg font-semibold">{t.studies.comparison}</h2>
    <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{t.studies.compareNote}</p>
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left text-xs">
        <thead className="border-b border-border"><tr><th className="w-2/5 py-3 pr-3">{t.studies.parameter}</th>{studies.map(study => <th key={study.id} className="break-words px-2 py-3 align-top">{study.title}</th>)}</tr></thead>
        <tbody>{parameters.map(parameter => <tr key={parameter} className="border-b border-border/50">
          <th className="break-all py-2 pr-3 font-normal text-muted-foreground">{parameter}</th>
          {measurements.map((values, i) => {
            const value = values.get(parameter);
            return <td key={i} className="break-all px-2 py-2 tabular-nums">{value == null ? '—' : typeof value === 'number' ? String(Number(value.toPrecision(6))) : String(value)}</td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}

export function StudiesDialog({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [removing, setRemoving] = useState(false);
  const chosen = selected.flatMap(id => studies.filter(study => study.id === id));
  const study = chosen.length === 1 ? chosen[0] : undefined;
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    let active = true;
    listStudies().then(rows => { if (active) { setStudies(rows); setSelected(rows.length ? [rows[0].id] : []); } })
      .catch(() => { if (active) setError(t.studies.error); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; element.close(); };
  }, [t.studies.error]);

  async function action(operation: () => Promise<void> | void) {
    setBusy(true); setError('');
    try { await operation(); } catch { setError(t.studies.error); } finally { setBusy(false); }
  }
  function select(ids: string[]) { setSelected(ids); setEditing(false); setRemoving(false); }

  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="studies-title"
    className="m-auto h-[92dvh] max-h-[1000px] w-[calc(100%-1rem)] max-w-6xl overflow-hidden rounded-lg border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/70 sm:w-[calc(100%-3rem)]">
    <div className="flex h-full min-w-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Archive className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <h1 id="studies-title" className="text-base font-semibold">{t.studies.title}</h1>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{t.studies.local} · {studies.length}</span>
        <button type="button" title={t.studies.close} aria-label={t.studies.close} onClick={onClose} className="rounded-md p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
      </header>
      {error && <p role="alert" className="border-b border-border px-4 py-2 text-sm text-red-400">{error}</p>}
      {loading ? <div role="status" className="grid flex-1 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin" /></div> : studies.length === 0 ?
        <p className="p-6 text-sm text-muted-foreground">{t.studies.empty}</p> :
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(130px,28%)_minmax(0,1fr)] md:grid-cols-[260px_minmax(0,1fr)] md:grid-rows-1">
          <aside className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r">
            <label className="m-3 flex items-center gap-2 rounded-md border border-border px-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input aria-label={t.studies.search} placeholder={t.studies.search} value={search} onChange={event => setSearch(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" />
            </label>
            <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {studies.filter(row => `${row.title} ${row.prompt}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(row =>
                <li key={row.id} className={`mb-1 flex items-center gap-2 rounded-md px-2 ${selected.includes(row.id) ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                  <input type="checkbox" aria-label={`${t.studies.compare}: ${row.title}`} checked={selected.includes(row.id)}
                    disabled={busy || (!selected.includes(row.id) && selected.length === 2)}
                    onChange={event => select(event.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} className="shrink-0 accent-purple-500" />
                  <button type="button" onClick={() => select([row.id])} disabled={busy} title={row.title} className="min-w-0 flex-1 py-3 text-left">
                    <span className="block truncate text-sm">{row.title}</span>
                    <span className="block text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString(lang)} · {row.message.analysisQuality?.input_kind ?? '-'}</span>
                  </button>
                </li>)}
            </ul>
          </aside>
          <section className="flex min-h-0 min-w-0 flex-col" aria-busy={busy}>
            {chosen.length > 0 && <div className="flex min-w-0 flex-wrap items-center gap-1 border-b border-border px-3 py-2">
              {study && (editing ? <form className="flex min-w-0 flex-1 gap-1" onSubmit={event => { event.preventDefault(); void action(async () => {
                const title = name.trim(); if (!title) return;
                await saveStudy({ ...study, title }); setStudies(await listStudies()); setEditing(false);
              }); }}>
                <input aria-label={t.studies.name} autoFocus required maxLength={120} value={name} onChange={event => setName(event.target.value)} className="min-w-0 flex-1 rounded-md border border-border bg-muted px-2 py-1 text-sm" />
                <button type="submit" disabled={busy} title={t.studies.apply} aria-label={t.studies.apply} className="rounded-md p-2 hover:bg-muted"><Check className="h-4 w-4" /></button>
              </form> : <>
                <h2 className="min-w-0 flex-1 truncate text-sm font-medium" title={study.title}>{study.title}</h2>
                <button type="button" title={t.studies.rename} aria-label={t.studies.rename} disabled={busy} onClick={() => { setName(study.title); setEditing(true); }} className="rounded-md p-2 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
              </>)}
              {busy && <LoaderCircle aria-label={t.studies.busy} className="m-2 h-4 w-4 animate-spin" />}
              {study && <button type="button" title={t.studies.pdf} aria-label={t.studies.pdf} disabled={busy} className="rounded-md p-2 hover:bg-muted disabled:opacity-40"
                onClick={() => void action(async () => { const { studyPdf } = await import('@/lib/studyPdf'); downloadBlob(await studyPdf(study, lang), `${study.title}.pdf`); })}><FileText className="h-4 w-4" /></button>}
              <button type="button" title={t.studies.csv} aria-label={t.studies.csv} disabled={busy} className="rounded-md p-2 hover:bg-muted disabled:opacity-40"
                onClick={() => void action(() => downloadBlob(new Blob([studyCsv(chosen)], { type: 'text/csv;charset=utf-8' }), `${study?.title ?? 'astronomia-comparison'}.csv`))}><FileSpreadsheet className="h-4 w-4" /></button>
              {study?.original && <button type="button" title={t.studies.original} aria-label={t.studies.original} disabled={busy} className="rounded-md p-2 hover:bg-muted disabled:opacity-40"
                onClick={() => downloadBlob(study.original!.blob, study.original!.filename)}><Download className="h-4 w-4" /></button>}
              {study && <button type="button" title={t.studies.remove} aria-label={t.studies.remove} disabled={busy} className="rounded-md p-2 text-red-400 hover:bg-muted disabled:opacity-40" onClick={() => setRemoving(!removing)}><Trash2 className="h-4 w-4" /></button>}
            </div>}
            {removing && study && <div className="flex flex-wrap gap-2 border-b border-border px-4 py-2">
              <button className="rounded-md bg-red-950 px-3 py-2 text-xs text-red-100" disabled={busy} onClick={() => void action(async () => {
                await deleteStudy(study.id); const rows = await listStudies(); setStudies(rows); select(rows.length ? [rows[0].id] : []);
              })}>{t.studies.confirmRemove}</button>
              <button className="rounded-md px-3 py-2 text-xs hover:bg-muted" onClick={() => setRemoving(false)}>{t.studies.cancel}</button>
            </div>}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {chosen.length === 2 ? <Comparison studies={chosen} /> : study ? <>
                <p className="mb-3 text-xs text-muted-foreground">{study.original ? t.studies.includedOriginal : t.studies.missingOriginal}</p>
                <p className="mb-4 break-words text-sm">{study.prompt}</p>
                <StudyPreview key={study.id} study={study} />
              </> : null}
            </div>
          </section>
        </div>}
      <footer className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground">{t.studies.storedLocally}</footer>
    </div>
  </dialog>;
}
