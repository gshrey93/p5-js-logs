import { StorageService } from './storage-service.js';

/**
 * ThemeManager — Dark / Light Mode Controller
 */
export class ThemeManager {
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
