import { describe, expect, it } from "vitest";
import { isExhausted } from "./rounds";

describe("isExhausted", () => {
  it('"all" never exhausts', () => {
    expect(isExhausted("all", 0)).toBe(false);
    expect(isExhausted("all", 10_000)).toBe(false);
  });

  it("undefined never exhausts (endless session)", () => {
    expect(isExhausted(undefined, 0)).toBe(false);
    expect(isExhausted(undefined, 500)).toBe(false);
  });

  it("a numeric limit exhausts exactly at the limit", () => {
    expect(isExhausted(10, 9)).toBe(false);
    expect(isExhausted(10, 10)).toBe(true);
    expect(isExhausted(10, 11)).toBe(true);
  });

  it("zero-limit sessions start exhausted", () => {
    expect(isExhausted(0, 0)).toBe(true);
  });
});
