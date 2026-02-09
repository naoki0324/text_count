import React from 'react';
import { AppSettings } from '../utils/settings';
import './SettingsPanel.css';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (newSettings: Partial<AppSettings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const handleToggle = (key: keyof AppSettings, value: any) => {
    onChange({ [key]: value });
  };

  const handleTextChange = (key: keyof AppSettings, value: string) => {
    onChange({ [key]: value });
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>設定</h3>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          <div className="setting-group">
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.includeNewlines}
                  onChange={(e) => handleToggle('includeNewlines', e.target.checked)}
                />
                <span>改行を文字数に含める</span>
              </label>
              <div className="setting-description">
                改行文字を文字数に含めてカウントします
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label setting-label-stack">
                <span>カウントから除外する文字</span>
                <input
                  type="text"
                  value={settings.excludeCharacters}
                  onChange={(e) => handleTextChange('excludeCharacters', e.target.value)}
                  placeholder="例: 、。！？「」"
                  className="text-input"
                />
              </label>
              <div className="setting-description">
                入力した文字はすべてカウント対象から除外します
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 
