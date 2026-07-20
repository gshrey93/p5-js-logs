import { eventBus } from './event-bus.js';
import { roundTo6 } from './utils.js';

const MAX_DIGITS = 12;
const LONG_PRESS_MS = 600;
const COPY_DISMISS_MS = 3000;

/**
 * CalculatorEngine — Core Calculator State & Expression Evaluator
 */
export class CalculatorEngine {
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
    this.lastOperator = null;
    this.lastOperand2 = null;
    this.updateDisplay();
  }
  inputDigit(digit) {
    if (this.isError) this.reset();
    if (this.awaitingOperand) {
      this.currentOperand = digit;
      this.awaitingOperand = false;
      this.result = '';
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
      this.result = '';
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
    } else if (this.operator === '+' || this.operator === '-') {
      const base = parseFloat(this.previousOperand);
      this.currentOperand = roundTo6(base * (current / 100));
    } else {
      this.currentOperand = roundTo6(current / 100);
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
    if (!this.operator && this.lastOperator && this.lastOperand2 !== null && this.currentOperand) {
      this.previousOperand = this.currentOperand;
      this.operator = this.lastOperator;
      this.currentOperand = this.lastOperand2;
      this.awaitingOperand = false;
    }
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
    this.lastOperator = this.operator;
    this.lastOperand2 = operand2;
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
    else if (e.key === '*' || e.key === 'x' || e.key === 'X') { e.preventDefault(); this.inputOperator('*'); }
    else if (e.key === '/') { e.preventDefault(); this.inputOperator('/'); }
    else if (e.key === '.') { e.preventDefault(); this.inputDecimal(); }
    else if (e.key === '%') { e.preventDefault(); this.inputPercent(); }
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); this.evaluate(); }
    else if (e.key === 'Backspace') { e.preventDefault(); this.backspace(); }
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C' || e.key === 'Delete') { e.preventDefault(); this.clear(); }
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
