import { getLang, texts, type Lang } from "@/lib/i18n";
import type { AnalysisQuality, ViewCaptureMetadata, ViewSnapshot } from "@/types/chat";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Shown when the BFF itself cannot be reached or answers with an error. The
// technical detail only goes to the browser console, never to the chat.
export function serviceUnavailableMessage(): string {
  return texts().serviceUnavailable;
}

export interface AnalyzePayload {
  request_id: string;
  message: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  task?: string;
  view_ra_deg?: number;
  view_dec_deg?: number;
  view_size_arcmin?: number;
  view_hips_id?: string;
  image_data?: string;
  view_metadata?: ViewCaptureMetadata;
  // Interface language (ES | EN button). The answer follows the language of the
  // message; this one is used when the message does not show it ("M31").
  language?: Lang;
}

export interface AnalyzeResponse {
  request_id: string;
  status: "success" | "error";
  summary: string;
  results?: Record<string, unknown>;
  artifacts?: { type: string; path: string }[];
}

export interface CoordinatesPayload {
  ra_deg: number;
  dec_deg: number;
  survey_used: string;
  hips_id?: string;
  size_arcmin: number;
}

// ─── Feedback ────────────────────────────────────────────────────────
// Tipos y funcion para enviar el feedback del usuario al endpoint /feedback
// del BFF. El BFF lo reenvia a n8n y de ahi a la pestania "feedback" de
// Google Sheets.

export interface FeedbackPayload {
  request_id: string;
  rating: "up" | "down";
  comment?: string;
  user_email?: string;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const base = API_BASE.replace(/\/$/, "");
  if (!base) {
    throw new Error(texts().notConfigured);
  }

  // Limpiamos campos opcionales vacios para no mandar "" innecesariamente.
  // El BFF tambien hace su limpieza, pero por defensa lo hacemos aqui.
  const body: FeedbackPayload = {
    request_id: payload.request_id,
    rating: payload.rating,
  };
  if (payload.comment && payload.comment.trim()) {
    body.comment = payload.comment.trim();
  }
  if (payload.user_email && payload.user_email.trim()) {
    body.user_email = payload.user_email.trim();
  }

  let res: Response;
  try {
    res = await fetch(`${base}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("feedback request failed", err);
    throw new Error(texts().feedbackUnavailable);
  }

  if (!res.ok) {
    console.warn(`feedback failed: HTTP ${res.status}`, (await res.text()).slice(0, 200));
    throw new Error(texts().feedbackUnavailable);
  }
}

export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "summary"; summary: string }
  | { type: "artifacts"; request_id: string; image_url?: string; coordinates?: CoordinatesPayload; object_info?: Record<string, unknown>; hst_jwst?: Record<string, unknown>; html_chart?: string; analysis_plots?: string[] }
  | { type: "end"; request_id: string; status: string; summary?: string; coordinates?: CoordinatesPayload; object_info?: Record<string, unknown>; hst_jwst?: Record<string, unknown>; object_name?: string; analysis_quality?: AnalysisQuality; suggested_actions?: { label: string; message: string }[] }
  | { type: "error"; message: string };

export async function sendMessageStream(
  message: string,
  conversationId: string,
  history: { role: "user" | "assistant"; content: string }[],
  onEvent: (event: StreamEvent) => void,
  viewSnapshot?: ViewSnapshot
): Promise<void> {
  const base = API_BASE.replace(/\/$/, "");
  if (!base) {
    onEvent({ type: "error", message: texts().notConfigured });
    return;
  }

  const requestId = `${conversationId}-${Date.now()}`;
  const body: AnalyzePayload = {
    request_id: requestId,
    message,
    messages: history.length > 0 ? history : undefined,
    language: getLang(),
    ...(viewSnapshot && {
      view_ra_deg: viewSnapshot.ra_deg,
      view_dec_deg: viewSnapshot.dec_deg,
      view_size_arcmin: viewSnapshot.size_arcmin,
      view_hips_id: viewSnapshot.hips_id,
      view_metadata: viewSnapshot.view_metadata,
      ...(viewSnapshot.image_data && { image_data: viewSnapshot.image_data }),
    }),
  };

  let res: Response;
  try {
    res = await fetch(`${base}/analyze/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("analyze request failed", err);
    onEvent({ type: "error", message: serviceUnavailableMessage() });
    return;
  }

  if (!res.ok) {
    console.warn(`analyze failed: HTTP ${res.status}`, (await res.text()).slice(0, 200));
    onEvent({ type: "error", message: serviceUnavailableMessage() });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onEvent({ type: "error", message: serviceUnavailableMessage() });
    return;
  }

  const dec = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        let data: string | null = null;
        for (const line of part.split("\n")) {
          if (line.startsWith("data: ")) data = line.slice(6);
        }
        if (data != null) {
          try {
            onEvent(JSON.parse(data) as StreamEvent);
          } catch {
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
