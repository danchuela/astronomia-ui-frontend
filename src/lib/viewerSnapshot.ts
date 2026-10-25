import type { ViewSnapshot } from "../types/chat";

export function sameView(a: ViewSnapshot | null, b: ViewSnapshot | null): boolean {
  if (!a || !b || !a.view_metadata || !b.view_metadata) return false;
  const raDistance = Math.abs(((a.ra_deg - b.ra_deg + 540) % 360) - 180);
  const am = a.view_metadata, bm = b.view_metadata;
  return a.hips_id === b.hips_id && raDistance < 1e-7
    && Math.abs(a.dec_deg - b.dec_deg) < 1e-7
    && Math.abs(a.size_arcmin - b.size_arcmin) < 1e-5
    && Math.abs(am.fov_y_deg - bm.fov_y_deg) < 1e-7
    && Math.abs(am.rotation_deg - bm.rotation_deg) < 1e-7
    && am.width_px === bm.width_px && am.height_px === bm.height_px
    && am.projection === bm.projection;
}

export function reuseCapture(cached: ViewSnapshot | null, current: ViewSnapshot): ViewSnapshot {
  // Pixels and metadata must travel together, including when the viewer is hidden.
  if (cached?.image_data && sameView(cached, current)) return cached;
  return { ...current, view_metadata: { ...current.view_metadata!, capture_required: true } };
}

export function reuseHiddenCapture(cached: ViewSnapshot | null, ra: number, dec: number, survey: string, rotation: number): ViewSnapshot | null {
  if (!cached?.view_metadata) return null;
  // Hiding resizes Aladin's layout, not the field the user selected.
  return reuseCapture(cached, { ...cached, ra_deg: ra, dec_deg: dec, hips_id: survey, image_data: undefined,
    view_metadata: { ...cached.view_metadata, ra_deg: ra, dec_deg: dec, hips_id: survey, rotation_deg: rotation } });
}
