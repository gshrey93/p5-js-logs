import { eventBus } from './event-bus.js';
import { roundTo6 } from './utils.js';
import { ConversionRegistry } from './conversion-registry.js';

/**
 * UnitConverter — DOM Controller for Unit Conversion Interface
 */
export class UnitConverter {
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
