import { useCallback, useEffect, useState } from 'react';

export function useToast(timeoutMs: number = 3000) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  const clear = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => {
      setMessage(null);
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [message, timeoutMs]);

  return { message, show, clear };
}
