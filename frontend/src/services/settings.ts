import type { AppSettings } from '../types/settings';

const DEFAULT_SETTINGS: AppSettings = {
  backendPort: 3001,
  parserPort: 8098,
  autoStartBackend: true,
  autoStartParser: false,
  theme: 'dark',
  language: 'en',
  lastUsername: '',
};

const SETTINGS_KEY = 'sdtracker_settings';

export function getSettings(): AppSettings {
  try {
    const settingsContent = localStorage.getItem(SETTINGS_KEY);
    if (settingsContent) {
      return JSON.parse(settingsContent);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export { DEFAULT_SETTINGS };
