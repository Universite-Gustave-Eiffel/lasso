import { useState, useCallback } from "react";

type SORU = string | undefined;
type SetterFunction<Z> = (prev: Z) => Z;

export function useLocalStorage(
  key: string,
  initialValue?: string,
): [SORU, (value: SORU | SetterFunction<SORU>) => void] {
  const [storedValue, setStoredValue] = useState<string | undefined>(() => {
    const item = window.localStorage.getItem(key);
    return typeof item === "string" ? item : initialValue;
  });

  const setValue = useCallback(
    (value: SORU | SetterFunction<SORU>) => {
      const computedValue = typeof value === "function" ? (value as SetterFunction<SORU>)(storedValue) : value;
      setStoredValue(computedValue);
      if (computedValue) window.localStorage.setItem(key, computedValue);
      else window.localStorage.removeItem(key);
    },
    [setStoredValue, key, storedValue],
  );

  return [storedValue, setValue];
}
