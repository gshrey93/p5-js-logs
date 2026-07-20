import { eventBus } from './event-bus.js';
import { StorageService } from './storage-service.js';

const HISTORY_KEY = 'calc_history';
const MAX_ENTRIES = 20;

/**
 * HistoryManager — Render & LocalStorage Persistence for Calculations & Conversions
 */
export class HistoryManager {
  constructor(listEl, clearBtn) {
    this.listEl = listEl;
    this.clearBtn = clearBtn;
    this.entries = [];
    this.loadFromStorage();
    this.render();
    this.bindEvents();
  }
  bindEvents() {
    eventBus.on('calculation-complete', ({ expression, result }) => {
      this.addEntry({ type: 'calculation', label: `${expression} = ${result}`, result });
    });
    eventBus.on('conversion-complete', ({ label, result }) => {
      this.addEntry({ type: 'conversion', label, result });
    });
    this.clearBtn.addEventListener('click', () => this.clearHistory());
  }
  addEntry(entry) {
    this.entries.unshift({ id: Date.now().toString(), ...entry, timestamp: Date.now() });
    if (this.entries.length > MAX_ENTRIES) this.entries.pop();
    this.saveToStorage();
    this.render();
  }
  clearHistory() {
    this.entries = [];
    StorageService.remove(HISTORY_KEY);
    this.render();
  }
  loadFromStorage() {
    const stored = StorageService.get(HISTORY_KEY);
    if (Array.isArray(stored)) this.entries = stored.slice(0, MAX_ENTRIES);
  }
  saveToStorage() { StorageService.set(HISTORY_KEY, this.entries); }
  render() {
    this.listEl.innerHTML = '';
    if (this.entries.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'history__empty';
      empty.textContent = 'No history yet';
      this.listEl.appendChild(empty);
      return;
    }
    this.entries.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'history__item';
      li.setAttribute('role', 'listitem');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `${entry.label}. Tap to reuse result.`);
      li.textContent = entry.label;
      li.addEventListener('click', () => eventBus.emit('history-reuse', { result: entry.result }));
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter') eventBus.emit('history-reuse', { result: entry.result }); });
      this.listEl.appendChild(li);
    });
  }
}
