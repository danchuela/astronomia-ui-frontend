import { test } from "node:test";
import assert from "node:assert/strict";
import { WAITING_TIPS } from "../src/lib/waitingTips.ts";

const emoji = /^\p{Extended_Pictographic}/u;

test("waiting tips: same entries in Spanish and English", () => {
  assert.equal(WAITING_TIPS.es.length, WAITING_TIPS.en.length);
  assert.ok(WAITING_TIPS.es.length >= 30);
  // Entry i is the same fact in both languages: same leading emoji.
  WAITING_TIPS.es.forEach((es, i) => assert.equal([...es][0], [...WAITING_TIPS.en[i]][0], `entry ${i}`));
});

test("waiting tips: no duplicates, each starts with an emoji and is short", () => {
  for (const lang of ["es", "en"] as const) {
    const tips = WAITING_TIPS[lang];
    assert.equal(new Set(tips).size, tips.length, `${lang}: duplicates`);
    for (const tip of tips) {
      assert.ok(emoji.test(tip), `${lang}: no emoji: ${tip}`);
      assert.ok(tip.length <= 160, `${lang}: too long: ${tip}`);
    }
  }
});
