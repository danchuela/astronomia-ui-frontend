import { useEffect, useState } from 'react';
import { Archive, Check, LoaderCircle } from 'lucide-react';
import type { Message } from '@/types/chat';
import type { UploadedImage } from '@/lib/uploads';
import { useLang } from '@/lib/i18n';

export function SaveStudyButton({ message, prompt, input }: { message: Message; prompt: string; input?: UploadedImage }) {
  const { t } = useLang();
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  useEffect(() => {
    const changed = (event: Event) => {
      const { id, deleted } = (event as CustomEvent<{ id: string; deleted: boolean }>).detail;
      if (id === message.requestId) setState(deleted ? 'idle' : 'saved');
    };
    window.addEventListener('astronomia-studies-changed', changed);
    return () => window.removeEventListener('astronomia-studies-changed', changed);
  }, [message.requestId]);
  async function save() {
    setState('saving'); setError('');
    try {
      const [{ snapshotStudy }, { listStudies, saveStudy }] = await Promise.all([import('@/lib/studySnapshot'), import('@/lib/studyStorage')]);
      const existing = (await listStudies()).find(study => study.id === message.requestId);
      if (!existing) await saveStudy(await snapshotStudy(message, prompt, import.meta.env.VITE_API_URL ?? '', input));
      setState('saved');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error && ['study_quota', 'study_size', 'QuotaExceededError'].includes(err.message) ? t.studies.quota : t.studies.saveError);
    }
  }
  return <div className="mt-3 border-t border-border pt-2">
    <button type="button" onClick={save} disabled={state !== 'idle'} title={t.studies.save}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-70">
      {state === 'saving' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : state === 'saved' ? <Check className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
      {state === 'saving' ? t.studies.saving : state === 'saved' ? t.studies.saved : t.studies.save}
    </button>
    {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
  </div>;
}
