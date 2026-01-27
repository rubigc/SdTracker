import { open } from '@tauri-apps/plugin-opener';

export async function openExternal(url: string): Promise<void> {
  try {
    await open(url);
  } catch (error) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
