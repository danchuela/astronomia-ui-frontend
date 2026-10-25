import { test } from "node:test";
import assert from "node:assert/strict";
import { reuseCapture, reuseHiddenCapture, sameView } from "../src/lib/viewerSnapshot.ts";
import type { ViewSnapshot } from "../src/types/chat.ts";

function capture(): ViewSnapshot {
  return {
    ra_deg: 210, dec_deg: 54, hips_id: "SDSS", size_arcmin: 30, image_data: "original-png",
    view_metadata: { ra_deg: 210, dec_deg: 54, hips_id: "SDSS", fov_x_deg: 0.5,
      fov_y_deg: 0.25, width_px: 1200, height_px: 600, rotation_deg: 0, projection: "SIN" },
  };
}

test("minimized viewer reuses the complete original capture and its own geometry", () => {
  const cached = capture();
  assert.equal(reuseCapture(cached, { ...cached, image_data: undefined }), cached);
  assert.equal(cached.view_metadata?.width_px, 1200);
});

for (const change of [
  { ra_deg: 211 }, { dec_deg: 53 }, { size_arcmin: 40 }, { hips_id: "DSS2" },
]) {
  test(`new field cannot reuse old pixels: ${JSON.stringify(change)}`, () => {
    const cached = capture();
    const current = { ...cached, ...change, image_data: undefined };
    assert.equal(sameView(cached, current), false);
    const result = reuseCapture(cached, current);
    assert.equal(result.image_data, undefined);
    assert.equal(result.view_metadata?.capture_required, true);
  });
}

test("changed image dimensions or vertical field invalidate the old capture", () => {
  const cached = capture();
  for (const changed of [{ height_px: 500 }, { fov_y_deg: 0.3 }, { rotation_deg: 12 }]) {
    assert.equal(sameView(cached, { ...cached, view_metadata: { ...cached.view_metadata!, ...changed } }), false);
  }
});

test("RA wraps at 360 degrees", () => {
  const cached = capture();
  cached.ra_deg = 0;
  assert.equal(sameView(cached, { ...cached, ra_deg: 360 }), true);
});

test("hidden layout changes preserve the last selected field without relabeling its pixels", () => {
  const cached = capture();
  assert.equal(reuseHiddenCapture(cached, 210, 54, "SDSS", 0), cached);
  assert.equal(reuseHiddenCapture(cached, 211, 54, "SDSS", 0)?.image_data, undefined);
  assert.equal(reuseHiddenCapture(cached, 210, 54, "DSS2", 0)?.image_data, undefined);
});
