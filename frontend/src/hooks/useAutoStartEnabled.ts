import { useEffect, useState } from 'react';
import { getAutoStartEnabled } from '../utils/autostart';

export function useAutoStartEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const read = () => {
      setEnabled(getAutoStartEnabled());
    };

    read();
    window.addEventListener('storage', read);
    window.addEventListener('sdtracker-autostart-changed', read);

    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sdtracker-autostart-changed', read);
    };
  }, []);

  return enabled;
}
