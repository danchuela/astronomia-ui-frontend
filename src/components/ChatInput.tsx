import { useLayoutEffect, useRef, useState } from "react";
import { Paperclip, FileImage, X, LoaderCircle, SendHorizontal } from "lucide-react";
import { IMAGE_ACCEPT, isFits, readUpload, validateUpload, type UploadedImage } from "@/lib/uploads";
import { openHelp } from "@/lib/help";
import { useLang } from "@/lib/i18n";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  attachment?: UploadedImage;
  onAttachmentChange: (image?: UploadedImage) => void;
}

export function ChatInput({ onSend, disabled, attachment, onAttachmentChange }: ChatInputProps) {
  const { t } = useLang();
  const [value, setValue] = useState("");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const busy = disabled || reading;

  useLayoutEffect(() => {
    const resize = () => {
      if (!textarea.current) return;
      textarea.current.style.height = '48px';
      textarea.current.style.height = `${Math.min(128, Math.max(48, textarea.current.scrollHeight + 2))}px`;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [value]);

  const attach = async (file?: File) => {
    if (!file || busy) return;
    const problem = validateUpload(file);
    if (problem) { setError(problem === 'size' ? t.uploadTooLarge : t.uploadFormat); return; }
    setReading(true);
    setError("");
    try { onAttachmentChange(await readUpload(file)); }
    catch { setError(t.uploadReadError); }
    finally { setReading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || busy) return;
    onSend(trimmed || t.analyzeUploadedImage);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div>
      {attachment && (
        <div className="mb-2 flex flex-wrap min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
          <FileImage className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[11px] text-muted-foreground">{t.analysisFile}</span>
            <span className="block truncate text-sm" title={attachment.filename}>{attachment.filename}</span>
          </div>
          {isFits(attachment.filename) && <label className="order-4 basis-full sm:order-none sm:basis-auto flex shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground">
            HDU
            <input type="number" min="0" max="63" step="1" placeholder="Auto" aria-label={t.fitsHdu}
              value={attachment.hdu_index ?? ''} disabled={busy}
              onChange={e => { const n = Number(e.target.value); if (e.target.value === '' || (Number.isInteger(n) && n >= 0 && n <= 63)) onAttachmentChange({ ...attachment, hdu_index: e.target.value === '' ? undefined : n }); }}
              className="w-16 rounded border border-input bg-background px-1 py-1" />
          </label>}
          <button type="button" disabled={busy} onClick={() => { onAttachmentChange(); setError(''); }}
            aria-label={t.removeImage} title={t.removeImage} className="p-2 rounded hover:bg-muted disabled:opacity-50">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {error && <p role="alert" className="mb-2 text-sm text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end"
        onDragOver={e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length !== 1) setError(t.uploadOneFile); else void attach(e.dataTransfer.files[0]); }}>
        <input ref={fileInput} type="file" accept={IMAGE_ACCEPT} className="hidden" aria-label={t.attachImage}
          disabled={busy} onChange={e => { void attach(e.target.files?.[0]); e.target.value = ''; }} />
        <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}
          title={t.attachImage} aria-label={t.attachImage}
          className="h-12 w-10 shrink-0 flex items-center justify-center rounded-lg border border-input hover:bg-muted disabled:opacity-50">
          {reading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Paperclip className="h-5 w-5" aria-hidden="true" />}
        </button>
        <textarea
          ref={textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          disabled={busy}
          rows={1}
          className="flex-1 min-w-0 min-h-[48px] max-h-32 py-3 px-4 rounded-xl resize-none bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label={t.send}
          title={t.send}
          disabled={(!value.trim() && !attachment) || busy}
          className="h-12 w-12 sm:w-auto sm:px-5 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
        >
          <SendHorizontal className="h-5 w-5 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
      {/* Fixed AI and privacy notice (backlog items 6 and 3). */}
      <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
        {t.aiNotice}{" "}
        <button
          type="button"
          onClick={() => openHelp(t.privacyQuery)}
          className="underline underline-offset-2 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded"
        >
          {t.privacyLink}
        </button>
      </p>
    </div>
  );
}
