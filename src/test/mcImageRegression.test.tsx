// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import MultiChoice from "../components/MultiChoice/MultiChoice";

// Hanging mock: never fires onload/onerror (premium hang)
class HangingImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  set src(v: string) { this._src = v; }
  get src() { return this._src; }
}

// Sync mock: fires onload synchronously if handler already assigned (cached image race)
// If handler not yet assigned, it does nothing (simulates the bug: src before handler loses event)
class SyncImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  set src(v: string) {
    this._src = v;
    // Simulate cached image: if onload already assigned, fire immediately (sync)
    // Otherwise, never fires (racy case: handler assigned after src)
    if (this.onload) this.onload();
  }
  get src() { return this._src; }
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.sessionStorage.clear();
});

describe("MC image regression: restore timeout + handler-before-src", () => {
  it("hanging restore recovers via timeout (hypothesis 1)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal("Image", HangingImage as any);
    const premiumId = "b-1";
    window.sessionStorage.setItem("picme.progress.multichoice.current", JSON.stringify({ savedAt: Date.now(), value: premiumId }));
    render(<MultiChoice settings={{ blur: 0, showDescription: false, difficulty: "all" }} />);
    // Restore timeout is 5s real - wait it out (testTimeout 10s)
    await new Promise(r => setTimeout(r, 5600));
    const hasBison = screen.getByText("American Bison");
    expect(hasBison).toBeInTheDocument();
  }, 10000);

  it("cached image with handlers-before-src shows image (hypothesis 2 - the console heisenbug)", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal("Image", SyncImage as any);
    render(<MultiChoice settings={{ blur: 0, showDescription: false }} />);
    // With fixed order (handlers before src), SyncImage will fire onload immediately after src set (since handler already assigned)
    // So image should appear within 1s (300ms delay + onload)
    const img = await screen.findByAltText(/.+/, {}, { timeout: 3000 });
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toBeTruthy();
  });
});
