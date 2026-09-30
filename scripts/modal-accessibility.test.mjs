import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appSource = await readFile(
  new URL("../src/App.tsx", import.meta.url),
  "utf8",
);

test("modal explicitly manages initial focus and Escape dismissal", () => {
  assert.match(appSource, /closeButtonRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(appSource, /onCancel=\{\(event\) => \{\s*event\.preventDefault\(\);\s*onClose\(\);/s);
  assert.match(appSource, /aria-modal="true"/);
  assert.match(appSource, /ref=\{closeButtonRef\}/);
});

test("modal restores focus to the opener when it unmounts", () => {
  assert.match(appSource, /const previousFocus = document\.activeElement/);
  assert.match(appSource, /previousFocus\?\.isConnected/);
  assert.match(appSource, /previousFocus\.focus\(\{ preventScroll: true \}\)/);
});

test("project detail dialog exposes its summary as the accessible description", () => {
  assert.match(appSource, /descriptionId=\{projectSummaryId\}/);
  assert.match(appSource, /<p id=\{projectSummaryId\} className="detail-summary">/);
  assert.match(appSource, /aria-describedby=\{descriptionId\}/);
});
