const AUTO_START_KEY = 'sdtracker.autostart';

function notifyAutoStartChanged() {
  window.dispatchEvent(new Event('sdtracker-autostart-changed'));
}

export function getAutoStartEnabled(): boolean {
  const flag = localStorage.getItem(AUTO_START_KEY);
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  return true;
}

export function setAutoStartEnabled(enabled: boolean) {
  localStorage.setItem(AUTO_START_KEY, enabled ? 'true' : 'false');
  notifyAutoStartChanged();
}
