import { useEffect, useRef } from 'react';
import { backendService } from '../services/backend';
import { parserService } from '../services/parser';
import { getAutoStartEnabled, getStoredUsername } from '../utils/autostart';

export function useAutoStartServices() {
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    const startServices = async () => {
      if (getAutoStartEnabled()) {
        try {
          const apiRunning = await backendService.isApiServerRunning();
          if (!apiRunning) {
            await backendService.startApiServer();
          }
        } catch {
          // Ignore auto-start failures; user can start manually.
        }
      }

      if (getAutoStartEnabled()) {
        try {
          const savedUsername = getStoredUsername();
          if (!savedUsername) {
            return;
          }
          const status = await parserService.getParserStatus();
          if (!status?.running) {
            await parserService.startParser(savedUsername);
          }
        } catch {
          // Ignore auto-start failures; user can start manually.
        }
      }
    };

    void startServices();
  }, []);
}
