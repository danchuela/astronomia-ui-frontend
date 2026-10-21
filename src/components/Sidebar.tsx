import { useAuth, clearEmail } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import type { Conversation } from "@/types/chat";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang, type Lang } from "@/lib/i18n";

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function formatTime(ts: number, lang: Lang) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString(lang, { day: "numeric", month: "short" });
}

// Conversations created before the language switch store the Spanish default title.
const DEFAULT_TITLES = new Set(["", "Nueva conversación", "New conversation"]);

export function Sidebar({
  conversations,
  currentId,
  onSelect,
  onNewChat,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { email } = useAuth();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const titleOf = (c: Conversation) => (DEFAULT_TITLES.has(c.title) ? t.newConversation : c.title);

  const handleLogout = () => {
    clearEmail();
    navigate("/login", { replace: true });
  };

  if (collapsed) {
    return (
      <div className="w-16 flex flex-col border-r border-border bg-sidebar/80 backdrop-blur-md shrink-0">
        <div className="p-3 flex justify-center border-b border-border">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground"
            title={t.expand}
          >
            <span className="text-xl">🌌</span>
          </button>
        </div>
        <div className="py-2 flex justify-center border-b border-border">
          <LanguageToggle compact />
        </div>
        <div className="p-2">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground"
            title={t.newChat}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {conversations.slice(0, 8).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full p-2 rounded-lg mb-1 text-left truncate text-xs ${
                currentId === c.id ? "bg-sidebar-accent text-sidebar-foreground" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
              title={titleOf(c)}
            >
              <span className="block truncate">{titleOf(c) || t.untitled}</span>
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground text-xs truncate"
            title={email ?? ""}
          >
            {t.logoutShort}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 flex flex-col border-r border-border bg-sidebar/80 backdrop-blur-md shrink-0 scrollbar-thin">
      <div className="p-4 flex items-center justify-between border-b border-border min-h-[60px]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon.png" alt="" className="w-10 rounded-lg mix-blend-screen" />
          <div>
            <img src="/logo-text.png" alt="astronomIA" className="h-4 mb-0.5" />
            <p className="text-xs text-muted-foreground">{t.assistant}</p>
          </div>
        </div>
        <LanguageToggle />
        <button
          type="button"
          onClick={onToggleCollapse}
          title={t.collapse}
          aria-label={t.collapse}
          className="p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="m-3 py-2.5 px-3 rounded-lg border border-border text-sidebar-foreground text-sm font-medium hover:bg-sidebar-accent/50 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t.newChat}
      </button>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          {t.conversations}
        </h3>
        {conversations.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">{t.noConversations}</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={`w-full text-left py-2.5 px-3 rounded-lg truncate block ${
                    currentId === c.id
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <span className="block text-sm font-medium truncate">{titleOf(c) || t.untitled}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{formatTime(c.updatedAt, lang)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground truncate px-2 mb-2" title={email ?? ""}>
          {email}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
}
