export interface AppSettings {
  backendPort: number;
  parserPort: number;
  autoStartBackend: boolean;
  autoStartParser: boolean;
  theme: 'dark' | 'light';
  language: string;
  lastUsername: string;
}
