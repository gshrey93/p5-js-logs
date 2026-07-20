import { ThemeManager } from './js/theme-manager.js';
import { CalculatorEngine } from './js/calculator-engine.js';
import { UnitConverter } from './js/unit-converter.js';
import { HistoryManager } from './js/history-manager.js';

/*
 * Calculator PWA — Orchestrator Entrypoint (sketch.js)
 * Coordinates ThemeManager, CalculatorEngine, UnitConverter, and HistoryManager.
 */
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
});
