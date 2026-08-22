/**
 * Test stand-in for the DOM Image constructor.
 *
 * jsdom never fires load/error events on images, so restore paths that
 * preload via `new Image()` would hang forever. This stub fails every image
 * asynchronously (deterministic "image unavailable" path) while keeping the
 * promise chains alive.
 */
export class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = "";

  set src(value: string) {
    this._src = value;
    void Promise.resolve().then(() => {
      this.onerror?.();
    });
  }

  get src(): string {
    return this._src;
  }
}
