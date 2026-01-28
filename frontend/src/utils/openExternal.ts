import { openUrl } from '@tauri-apps/plugin-opener';

export async function openExternal(url: string): Promise<void> {
  try {
    await openUrl(url);
  } catch (error) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
