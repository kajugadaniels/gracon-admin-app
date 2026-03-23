// Debounces a value — used for search inputs so the API is not called
// on every keystroke. 350ms is the sweet spot — fast enough to feel
// responsive, slow enough to avoid hammering the server.
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}