const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface AnalyzePayload {
  request_id: string;
  message: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  task?: string;
  options?: { view_target_name?: string };
  view_ra_deg?: number;
  view_dec_deg?: number;
  view_size_arcmin?: number;
  view_hips_id?: string;
  image_data?: string;
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

export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "summary"; summary: string }
  | { type: "artifacts"; request_id: string; image_url?: string; coordinates?: CoordinatesPayload; object_info?: Record<string, unknown>; hst_jwst?: Record<string, unknown>; html_chart?: string; analysis_plots?: string[] }
  | { type: "end"; request_id: string; status: string; summary?: string; coordinates?: CoordinatesPayload; object_info?: Record<string, unknown>; hst_jwst?: Record<string, unknown>; object_name?: string }
  | { type: "error"; message: string };

export async function sendMessageStream(
  message: string,
  conversationId: string,
  history: { role: "user" | "assistant"; content: string }[],
  onEvent: (event: StreamEvent) => void,
  viewSnapshot?: { ra_deg: number; dec_deg: number; size_arcmin: number; hips_id: string; image_data?: string },
  viewTargetName?: string
): Promise<void> {
  const base = API_BASE.replace(/\/$/, "");
  if (!base) {
    onEvent({ type: "error", message: "VITE_API_URL no configurado." });
    return;
  }

  const requestId = `${conversationId}-${Date.now()}`;
  const body: AnalyzePayload = {
    request_id: requestId,
    message,
    messages: history.length > 0 ? history : undefined,
    ...(viewTargetName && { options: { view_target_name: viewTargetName } }),
    ...(viewSnapshot && {
      view_ra_deg: viewSnapshot.ra_deg,
      view_dec_deg: viewSnapshot.dec_deg,
      view_size_arcmin: viewSnapshot.size_arcmin,
      view_hips_id: viewSnapshot.hips_id,
      ...(viewSnapshot.image_data && { image_data: viewSnapshot.image_data }),
    }),
  };

  const res = await fetch(`${base}/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    onEvent({ type: "error", message: `Error ${res.status}: ${text.slice(0, 200)}` });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onEvent({ type: "error", message: "No se pudo leer el stream." });
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
