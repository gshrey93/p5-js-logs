/**
 * StorageService — Safe LocalStorage Abstraction
 */
export const StorageService = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* graceful fail */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch (e) { /* graceful fail */ }
  }
};
