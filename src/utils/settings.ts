import { CountOptions } from './textCounter';

export interface AppSettings extends CountOptions {
  realtimeMode: boolean;
  autoSave: boolean;
  showCharacterFrequency: boolean;
  debounceDelay: number;
  displayFormat: {
    useThousandsSeparator: boolean;
    showUnits: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  realtimeMode: true,
  autoSave: true,
  includeNewlines: true,
  excludeSpaces: false,
  useManuscriptRules: true,
  normalization: 'none',
  showCharacterFrequency: false,
  debounceDelay: 300,
  displayFormat: {
    useThousandsSeparator: true,
    showUnits: true
  }
};

export class SettingsManager {
  private static readonly STORAGE_KEY = 'text-count-tool-settings';
  private static readonly TEXT_STORAGE_KEY = 'text-count-tool-text';

  static loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  static loadText(): string {
    try {
      return localStorage.getItem(this.TEXT_STORAGE_KEY) || '';
    } catch (error) {
      console.warn('Failed to load text:', error);
      return '';
    }
  }

  static saveText(text: string): void {
    try {
      localStorage.setItem(this.TEXT_STORAGE_KEY, text);
    } catch (error) {
      console.warn('Failed to save text:', error);
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TEXT_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }

  static exportSettings(): string {
    const settings = this.loadSettings();
    const text = this.loadText();
    const exportData = {
      settings,
      text,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importSettings(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.text) {
        this.saveText(data.text);
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 