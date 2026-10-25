export type MessageRole = "user" | "assistant";

export interface AladinCoordinates {
  ra_deg: number;
  dec_deg: number;
  survey_used: string;
  hips_id?: string;
  size_arcmin: number;
}

export interface ObjectInfo {
  main_id?: string;
  otype?: string;
  otype_long?: string;
  morph_type?: string;
  rvz_radvel?: number;
  rvz_redshift?: number;
  sp_type?: string;
}

export interface HstJwstInfo {
  collection: string;
  obs_id: string;
  instrument: string;
  filters: string;
  jpeg_url?: string | null;
}

export interface ViewSnapshot {
  ra_deg: number;
  dec_deg: number;
  size_arcmin: number;
  hips_id: string;
  image_data?: string;
  view_metadata?: ViewCaptureMetadata;
}

export interface ViewCaptureMetadata {
  ra_deg: number;
  dec_deg: number;
  hips_id: string;
  fov_x_deg: number;
  fov_y_deg: number;
  width_px: number;
  height_px: number;
  rotation_deg: number;
  projection: "SIN";
  capture_required?: boolean;
}

export interface AnalysisQuality {
  status: "exploratory" | "partial" | "unavailable";
  reason?: string;
  modules?: Record<string, "ok" | "suspect" | "unavailable" | "missing">;
  issues?: string[];
  input_kind?: "rendered" | "fits";
  source?: "upload" | "viewer";
}

// Quick-reply button sent by the BFF (e.g. analyses after "Muéstrame M51").
export interface SuggestedAction {
  label: string;
  message: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachmentName?: string;
  imageUrl?: string;
  analysisPlots?: string[];   // analysis plot names (cas, radial_profile, etc.)
  analysisQuality?: AnalysisQuality;
  coordinates?: AladinCoordinates;
  objectInfo?: ObjectInfo;
  hstJwst?: HstJwstInfo;
  objectName?: string;
  observationHtml?: string;
  suggestedActions?: SuggestedAction[];
  // request_id que asigna el BFF a esta interaccion. Lo usamos para vincular
  // el feedback del usuario con la consulta concreta a la que se refiere.
  requestId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  activeAttachmentName?: string | null;
}
