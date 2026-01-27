import { useEffect, useState } from "react";

export default function useLocalJSON<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      if (s) return JSON.parse(s) as T;
    } catch (error) {
      // ignore and fall back to initial
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}
