import type { Conversation, Message } from "@/types/chat";

const STORAGE_KEY = "astronomia_conversations";

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function getConversations(): Conversation[] {
  return load().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | undefined {
  return load().find((c) => c.id === id);
}

export function createConversation(title: string = "Nueva conversación"): Conversation {
  const conv: Conversation = {
    id: crypto.randomUUID(),
    title,
    messages: [],
    updatedAt: Date.now(),
  };
  const list = load();
  list.unshift(conv);
  save(list);
  return conv;
}

export function updateConversation(
  id: string,
  update: Partial<Pick<Conversation, "title" | "messages">>
): void {
  const list = load();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...update, updatedAt: Date.now() };
  save(list);
}

export function appendMessage(conversationId: string, message: Message): void {
  const list = load();
  const conv = list.find((c) => c.id === conversationId);
  if (!conv) return;
  conv.messages.push(message);
  conv.updatedAt = Date.now();
  if (conv.messages.length === 1 && message.role === "user") {
    conv.title = message.content.slice(0, 50) || "Nueva conversación";
  }
  save(list);
}

export function updateMessage(
  conversationId: string,
  messageId: string,
  update: Partial<Pick<Message, "content" | "imageUrl" | "coordinates" | "objectInfo" | "hstJwst" | "objectName">>
): void {
  const list = load();
  const conv = list.find((c) => c.id === conversationId);
  if (!conv) return;
  const msg = conv.messages.find((m) => m.id === messageId);
  if (!msg) return;
  Object.assign(msg, update);
  conv.updatedAt = Date.now();
  save(list);
}

export function deleteConversation(id: string): void {
  save(load().filter((c) => c.id !== id));
}
