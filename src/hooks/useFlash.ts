import { useRef, useState } from "react";

export type FlashState = "correct" | "wrong" | null;

export default function useFlash(initial: FlashState = null) {
  const [flashState, setFlashState] = useState<FlashState>(initial);
  const flashTimeoutRef = useRef<number | null>(null);

  const clearFlash = () => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    setFlashState(null);
  };

  const triggerFlash = (state: "correct" | "wrong") => {
    clearFlash();
    requestAnimationFrame(() => {
      setFlashState(state);
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashState(null);
        flashTimeoutRef.current = null;
      }, 1200);
    });
  };

  return { flashState, triggerFlash, clearFlash } as const;
}
