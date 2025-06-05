import { Injectable, RendererFactory2, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppTheme } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private readonly THEME_STORAGE_KEY = 'app-theme';

  // Define your available themes
  // The className should match the classes in your styles.css
  public availableThemes: AppTheme[] = [
    { name: 'Catppuccin Mocha', className: 'theme-first' },
    { name: 'Crimson Night', className: 'theme-second' },
    { name: 'Desert Mirage', className: 'theme-third' },
    { name: 'Synthwave Rider', className: 'theme-fourth' },
    { name: 'Sakura Sunset', className: 'theme-fifth' }
  ];

  private currentThemeClassName = new BehaviorSubject<AppTheme>(this.availableThemes[0]);
  public currentThemeClassName$: Observable<AppTheme> = this.currentThemeClassName.asObservable();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.loadSavedTheme();
  }

  private loadSavedTheme(): void {
    const savedThemeClassName = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (savedThemeClassName && this.availableThemes.some(t => t.className === savedThemeClassName)) {
      this.setTheme(savedThemeClassName, false); // Don't re-save what we just loaded
    } else {
      // Apply default theme if no valid saved theme
      this.setTheme(this.availableThemes[0].className, true);
    }
  }

  public setTheme(themeClassName: string, saveToStorage: boolean = true): void {
    const themeExists = this.availableThemes.some(t => t.className === themeClassName);
    if (!themeExists) {
      console.warn(`ThemeService: Theme with class "${themeClassName}" not found. Applying default.`);
      this.setTheme(this.availableThemes[0].className, saveToStorage); // Apply default
      return;
    }

    // Remove all known theme classes from the body
    this.availableThemes.forEach(theme => {
      this.renderer.removeClass(this.document.body, theme.className);
    });

    // Add the new theme class
    this.renderer.addClass(this.document.body, themeClassName);
    this.currentThemeClassName.next({ name: this.availableThemes.find(t => t.className === themeClassName)?.name || 'Default', className: themeClassName });

    if (saveToStorage) {
      localStorage.setItem(this.THEME_STORAGE_KEY, themeClassName);
    }
  }

  public getThemes(): AppTheme[] {
    return this.availableThemes;
  }

  public getCurrentTheme(): AppTheme | undefined {
    const currentClass = this.currentThemeClassName.value;
    return this.availableThemes.find(theme => theme.className === currentClass.className);
  }
}