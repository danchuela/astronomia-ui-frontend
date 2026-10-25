import { useState } from "react";
import { openHelp } from "@/lib/help";
import { useLang } from "@/lib/i18n";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useLang();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
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
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 min-w-0 min-h-[48px] max-h-32 py-3 px-4 rounded-xl resize-none bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
        >
          {t.send}
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
