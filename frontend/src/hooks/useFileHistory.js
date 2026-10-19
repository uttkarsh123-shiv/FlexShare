const STORAGE_KEY = 'flexshare_history';
const MAX_ENTRIES = 50;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToHistory({ code, fileName, conversionType, expiryHours }) {
  try {
    const history = getHistory();
    // avoid duplicates
    const filtered = history.filter(e => e.code !== code);
    const expiresAt = expiryHours
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      : null;
    const entry = {
      code,
      fileName: fileName || 'Unknown file',
      conversionType: conversionType || 'none',
      uploadedAt: new Date().toISOString(),
      expiresAt,
    };
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeFromHistory(code) {
  try {
    const updated = getHistory().filter(e => e.code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
