/*
 * Calculator PWA — Single File (sketch.js)
 * All modules combined: EventBus, StorageService, ThemeManager,
 * CalculatorEngine, ConversionRegistry, UnitConverter, HistoryManager, AppShell.
 */

// ============================================================
// EventBus
// ============================================================
const eventBus = (() => {
  const listeners = {};
  return {
    on(event, handler) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    off(event, handler) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    emit(event, payload) {
      if (!listeners[event]) return;
      listeners[event].forEach(handler => handler(payload));
    }
  };
})();

// ============================================================
// StorageService
// ============================================================
const StorageService = {
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

// ============================================================
// ThemeManager
// ============================================================
class ThemeManager {
  constructor(toggleBtn) {
    this.toggleBtn = toggleBtn;
    this.currentTheme = 'light';
  }
  init() {
    const stored = StorageService.get('calc_theme');
    if (stored === 'light' || stored === 'dark') {
      this.currentTheme = stored;
    } else {
      this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    this.apply(this.currentTheme);
    this.toggleBtn.addEventListener('click', () => this.toggle());
  }
  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.apply(this.currentTheme);
    StorageService.set('calc_theme', this.currentTheme);
  }
  apply(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
    const icon = this.toggleBtn.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ============================================================
// Utility: roundTo6
// ============================================================
function roundTo6(value) {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  let str = rounded.toString();
  if (str.includes('.')) str = str.replace(/\.?0+$/, '');
  return str;
}

// ============================================================
// CalculatorEngine
// ============================================================
const MAX_DIGITS = 12;
const LONG_PRESS_MS = 600;
const COPY_DISMISS_MS = 3000;

class CalculatorEngine {
  constructor(displayEl, expressionEl, copyBtn) {
    this.displayEl = displayEl;
    this.expressionEl = expressionEl;
    this.copyBtn = copyBtn;
    this.reset();
    this.longPressTimer = null;
    this.copyDismissTimer = null;
    this.bindLongPress();
    this.bindHistoryReuse();
  }
  reset() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operator = null;
    this.result = '';
    this.expression = '';
    this.isError = false;
    this.awaitingOperand = false;
    this.updateDisplay();
  }
  inputDigit(digit) {
    if (this.isError) this.reset();
    if (this.awaitingOperand) {
      this.currentOperand = digit;
      this.awaitingOperand = false;
    } else {
      if (this.currentOperand === '0' && digit !== '0') {
        this.currentOperand = digit;
      } else if (this.currentOperand === '0' && digit === '0') {
        return;
      } else {
        const digits = this.currentOperand.replace('.', '').replace('-', '');
        if (digits.length >= MAX_DIGITS) return;
        this.currentOperand += digit;
      }
    }
    this.updateDisplay();
  }
  inputOperator(op) {
    if (this.isError) return;
    if (this.previousOperand && this.operator && !this.awaitingOperand) {
      this.evaluate(false);
      if (this.isError) return;
    }
    if (this.awaitingOperand && this.result) {
      this.previousOperand = this.result;
    } else {
      this.previousOperand = this.currentOperand;
    }
    this.operator = op;
    this.awaitingOperand = true;
    this.expression = `${this.previousOperand} ${this.operatorSymbol(op)}`;
    this.updateDisplay();
  }
  inputDecimal() {
    if (this.isError) this.reset();
    if (this.awaitingOperand) {
      this.currentOperand = '0.';
      this.awaitingOperand = false;
    } else if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
    }
    this.updateDisplay();
  }
  inputPercent() {
    if (this.isError) return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    if (this.operator === null) {
      this.currentOperand = roundTo6(current / 100);
    } else {
      const base = parseFloat(this.previousOperand);
      this.currentOperand = roundTo6(base * (current / 100));
    }
    this.updateDisplay();
  }
  toggleSign() {
    if (this.isError) return;
    if (this.currentOperand === '0' || this.currentOperand === '') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
    this.updateDisplay();
  }
  backspace() {
    if (this.isError || this.awaitingOperand) return;
    this.currentOperand = this.currentOperand.slice(0, -1);
    if (this.currentOperand === '' || this.currentOperand === '-') {
      this.currentOperand = '0';
    }
    this.updateDisplay();
  }
  clear() { this.reset(); }
  evaluate(emitEvent = true) {
    if (this.isError) return;
    if (!this.operator || !this.previousOperand) return;
    let operand2 = this.awaitingOperand ? this.previousOperand : this.currentOperand;
    const a = parseFloat(this.previousOperand);
    const b = parseFloat(operand2);
    if (isNaN(a) || isNaN(b)) { this.setError('Invalid expression'); return; }
    let raw;
    switch (this.operator) {
      case '+': raw = a + b; break;
      case '-': raw = a - b; break;
      case '*': raw = a * b; break;
      case '/':
        if (b === 0) { this.setError('Cannot divide by zero'); return; }
        raw = a / b; break;
      default: this.setError('Invalid operation'); return;
    }
    if (!isFinite(raw)) { this.setError('Result is too large'); return; }
    if (isNaN(raw)) { this.setError('Invalid operation'); return; }
    this.result = roundTo6(raw);
    const fullExpression = `${this.previousOperand} ${this.operatorSymbol(this.operator)} ${operand2}`;
    this.expression = `${fullExpression} =`;
    this.currentOperand = this.result;
    this.previousOperand = '';
    this.operator = null;
    this.awaitingOperand = true;
    this.updateDisplay();
    if (emitEvent) {
      eventBus.emit('calculation-complete', { expression: fullExpression, result: this.result });
    }
  }
  setError(message) {
    this.isError = true;
    this.currentOperand = '';
    this.result = '';
    this.expression = '';
    this.displayEl.textContent = message;
    this.expressionEl.textContent = '';
  }
  updateDisplay() {
    this.expressionEl.textContent = this.expression;
    this.displayEl.textContent = this.awaitingOperand && this.result ? this.result : this.currentOperand || '0';
  }
  operatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return symbols[op] || op;
  }
  handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); this.inputDigit(e.key); }
    else if (e.key === '+') { e.preventDefault(); this.inputOperator('+'); }
    else if (e.key === '-') { e.preventDefault(); this.inputOperator('-'); }
    else if (e.key === '*') { e.preventDefault(); this.inputOperator('*'); }
    else if (e.key === '/') { e.preventDefault(); this.inputOperator('/'); }
    else if (e.key === '.') { e.preventDefault(); this.inputDecimal(); }
    else if (e.key === '%') { e.preventDefault(); this.inputPercent(); }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); this.evaluate(); }
    else if (e.key === 'Backspace') { e.preventDefault(); this.backspace(); }
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { e.preventDefault(); this.clear(); }
  }
  // Long-press copy
  bindLongPress() {
    const clipboardSupported = !!(navigator.clipboard && navigator.clipboard.writeText);
    if (!clipboardSupported) return;
    this.displayEl.addEventListener('pointerdown', () => {
      if (this.isError || (!this.result && this.currentOperand === '0')) return;
      this.longPressTimer = setTimeout(() => this.showCopyBtn(), LONG_PRESS_MS);
    });
    this.displayEl.addEventListener('pointerup', () => this.cancelLongPress());
    this.displayEl.addEventListener('pointerleave', () => this.cancelLongPress());
    this.copyBtn.addEventListener('click', () => this.copyResult());
  }
  cancelLongPress() {
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
  }
  showCopyBtn() {
    this.copyBtn.classList.remove('hidden');
    this.copyDismissTimer = setTimeout(() => this.hideCopyBtn(), COPY_DISMISS_MS);
  }
  hideCopyBtn() {
    this.copyBtn.classList.add('hidden');
    if (this.copyDismissTimer) { clearTimeout(this.copyDismissTimer); this.copyDismissTimer = null; }
  }
  async copyResult() {
    const text = this.result || this.currentOperand;
    try { await navigator.clipboard.writeText(text); } catch (e) { /* fail silently */ }
    this.hideCopyBtn();
  }
  // History reuse
  bindHistoryReuse() {
    eventBus.on('history-reuse', ({ result }) => {
      this.currentOperand = result;
      this.awaitingOperand = false;
      this.isError = false;
      this.updateDisplay();
    });
  }
}

// ============================================================
// ConversionRegistry
// ============================================================
const FACTORS = {
  Length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 },
  'Weight/Mass': { mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, ounce: 0.0283495, pound: 0.453592 },
  Area: { 'cm²': 0.0001, 'm²': 1, 'km²': 1_000_000, 'inch²': 0.00064516, 'foot²': 0.092903, acre: 4046.86, hectare: 10000 },
  Volume: { ml: 0.001, litre: 1, 'm³': 1000, 'fl oz': 0.0295735, pint: 0.473176, gallon: 3.78541 },
  Speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 }
};

function convertTemperature(value, from, to) {
  if (from === to) return value;
  let celsius;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else if (from === 'K') celsius = value - 273.15;
  else return NaN;
  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  if (to === 'K') return celsius + 273.15;
  return NaN;
}

const ConversionRegistry = {
  getCategories() { return ['Length', 'Weight/Mass', 'Temperature', 'Area', 'Volume', 'Speed']; },
  getUnits(category) {
    if (category === 'Temperature') return ['°C', '°F', 'K'];
    return Object.keys(FACTORS[category] || {});
  },
  convert(value, fromUnit, toUnit, category) {
    if (fromUnit === toUnit) return value;
    if (category === 'Temperature') return convertTemperature(value, fromUnit, toUnit);
    const factors = FACTORS[category];
    if (!factors || !factors[fromUnit] || !factors[toUnit]) return NaN;
    return (value * factors[fromUnit]) / factors[toUnit];
  }
};

// ============================================================
// UnitConverter
// ============================================================
class UnitConverter {
  constructor(categoryEl, inputEl, fromEl, toEl, resultEl) {
    this.categoryEl = categoryEl;
    this.inputEl = inputEl;
    this.fromEl = fromEl;
    this.toEl = toEl;
    this.resultEl = resultEl;
    this.category = '';
    this.init();
  }
  init() {
    const categories = ConversionRegistry.getCategories();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      this.categoryEl.appendChild(opt);
    });
    this.categoryEl.addEventListener('change', () => this.selectCategory(this.categoryEl.value));
    this.inputEl.addEventListener('input', () => this.convert());
    this.fromEl.addEventListener('change', () => this.convert());
    this.toEl.addEventListener('change', () => this.convert());
    if (categories.length > 0) this.selectCategory(categories[0]);
  }
  selectCategory(category) {
    this.category = category;
    const units = ConversionRegistry.getUnits(category);
    this.fromEl.innerHTML = '';
    this.toEl.innerHTML = '';
    units.forEach(unit => {
      const opt1 = document.createElement('option'); opt1.value = unit; opt1.textContent = unit;
      this.fromEl.appendChild(opt1);
      const opt2 = document.createElement('option'); opt2.value = unit; opt2.textContent = unit;
      this.toEl.appendChild(opt2);
    });
    if (units.length > 1) this.toEl.value = units[1];
    this.convert();
  }
  convert() {
    const raw = this.inputEl.value.trim();
    if (raw === '' || isNaN(Number(raw))) { this.resultEl.textContent = '—'; return; }
    const value = parseFloat(raw);
    const fromUnit = this.fromEl.value;
    const toUnit = this.toEl.value;
    if (value < 0 && this.category !== 'Temperature') { this.resultEl.textContent = '—'; return; }
    const result = ConversionRegistry.convert(value, fromUnit, toUnit, this.category);
    if (isNaN(result) || !isFinite(result)) { this.resultEl.textContent = '—'; return; }
    const formatted = roundTo6(result);
    this.resultEl.textContent = formatted;
    eventBus.emit('conversion-complete', { label: `${raw} ${fromUnit} → ${formatted} ${toUnit}`, result: formatted });
  }
}

// ============================================================
// HistoryManager
// ============================================================
const HISTORY_KEY = 'calc_history';
const MAX_ENTRIES = 20;
class HistoryManager {
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

// ============================================================
// AppShell — Bootstrap
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const themeToggle = document.getElementById('themeToggle');
  const tabCalc = document.getElementById('tabCalc');
  const tabConv = document.getElementById('tabConv');
  const viewCalc = document.getElementById('viewCalc');
  const viewConv = document.getElementById('viewConv');
  const resultEl = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const copyBtn = document.getElementById('copyBtn');
  const historyList = document.getElementById('historyList');
  const clearHistory = document.getElementById('clearHistory');
  const convCategory = document.getElementById('convCategory');
  const convInput = document.getElementById('convInput');
  const convFrom = document.getElementById('convFrom');
  const convTo = document.getElementById('convTo');
  const convResult = document.getElementById('convResult');

  // Initialise components
  const theme = new ThemeManager(themeToggle);
  theme.init();
  const calculator = new CalculatorEngine(resultEl, expressionEl, copyBtn);
  const converter = new UnitConverter(convCategory, convInput, convFrom, convTo, convResult);
  const history = new HistoryManager(historyList, clearHistory);

  // Tab switching
  let activeTab = 'calculator';
  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'calculator') {
      viewCalc.classList.add('view--active'); viewCalc.hidden = false;
      viewConv.classList.remove('view--active'); viewConv.hidden = true;
      tabCalc.classList.add('tab-bar__tab--active'); tabCalc.setAttribute('aria-selected', 'true');
      tabConv.classList.remove('tab-bar__tab--active'); tabConv.setAttribute('aria-selected', 'false');
    } else {
      viewConv.classList.add('view--active'); viewConv.hidden = false;
      viewCalc.classList.remove('view--active'); viewCalc.hidden = true;
      tabConv.classList.add('tab-bar__tab--active'); tabConv.setAttribute('aria-selected', 'true');
      tabCalc.classList.remove('tab-bar__tab--active'); tabCalc.setAttribute('aria-selected', 'false');
    }
  }

  tabCalc.addEventListener('click', () => switchTab('calculator'));
  tabConv.addEventListener('click', () => switchTab('converter'));

  // Calculator button grid
  const grid = document.querySelector('.calc__grid');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc__btn');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case 'digit': calculator.inputDigit(value); break;
      case 'operator': calculator.inputOperator(value); break;
      case 'decimal': calculator.inputDecimal(); break;
      case 'percent': calculator.inputPercent(); break;
      case 'toggleSign': calculator.toggleSign(); break;
      case 'backspace': calculator.backspace(); break;
      case 'clear': calculator.clear(); break;
      case 'evaluate': calculator.evaluate(); break;
    }
  });

  // Keyboard support (only when calculator tab is active)
  document.addEventListener('keydown', (e) => {
    if (activeTab !== 'calculator') return;
    calculator.handleKeyboard(e);
  });

  // Temporarily disable service worker unless you explicitly plan to have it 
  /*
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(err => console.warn('SW registration failed:', err));
  }
  */
});
