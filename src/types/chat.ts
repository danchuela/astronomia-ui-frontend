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
  image_data?: string; // base64 JPEG canvas capture; undefined when CORS prevents it
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  analysisPlots?: string[];   // analysis plot names (cas, radial_profile, etc.)
  coordinates?: AladinCoordinates;
  objectInfo?: ObjectInfo;
  hstJwst?: HstJwstInfo;
  objectName?: string;
  observationHtml?: string;
  // request_id que asigna el BFF a esta interaccion. Lo usamos para vincular
  // el feedback del usuario con la consulta concreta a la que se refiere.
  requestId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}
