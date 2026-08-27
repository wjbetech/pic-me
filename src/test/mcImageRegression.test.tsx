// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import MultiChoice from "../components/MultiChoice/MultiChoice";

// No Image mock needed for direct-render path — jsdom's <img> never fires
// onLoad/onError by default (hang), which is exactly the premium hang we test.

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

describe("MC image regression: direct-render timeout + onLoad wiring", () => {
  it("hanging restore recovers via rendered-img timeout (was infinite hang)", async () => {
    const premiumId = "b-1";
    window.sessionStorage.setItem("picme.progress.multichoice.current", JSON.stringify({ savedAt: Date.now(), value: premiumId }));
    render(<MultiChoice settings={{ blur: 0, showDescription: false, difficulty: "all" }} />);
    // jsdom <img> never fires onLoad, so the 5s hang guard must fire and fall back
    await new Promise(r => setTimeout(r, 5600));
    const hasBison = screen.getByText("American Bison");
    expect(hasBison).toBeInTheDocument();
  }, 10000);

  it("successful load clears spinner via onLoad (was src-before-handler race)", async () => {
    const { container } = render(<MultiChoice settings={{ blur: 0, showDescription: false }} />);
    const img = await screen.findByAltText(/.+/, {}, { timeout: 3000 }) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    // Spinner should be present while loading
    expect(container.querySelector(".mc-spinner")).toBeInTheDocument();
    // Simulate browser firing load
    const loadEvent = new Event("load");
    Object.defineProperty(loadEvent, "currentTarget", { value: img });
    img.dispatchEvent(loadEvent);
    // After onLoad, spinner should be gone
    await new Promise(r => setTimeout(r, 50));
    expect(container.querySelector(".mc-spinner")).not.toBeInTheDocument();
  });
});
