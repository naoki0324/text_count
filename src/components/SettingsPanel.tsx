import React, { useState } from 'react';
import { AppSettings } from '../utils/settings';
import './SettingsPanel.css';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (newSettings: Partial<AppSettings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (key: keyof AppSettings, value: any) => {
    onChange({ [key]: value });
  };

  const handleNestedToggle = (parentKey: keyof AppSettings, childKey: string, value: any) => {
    const parent = settings[parentKey] as any;
    onChange({
      [parentKey]: {
        ...parent,
        [childKey]: value
      }
    });
  };

  const handleNumberChange = (key: keyof AppSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onChange({ [key]: numValue });
    }
  };

  const handleSelectChange = (key: keyof AppSettings, value: string) => {
    onChange({ [key]: value });
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>設定</h3>
        <button 
          className="expand-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="settings-content">
          <div className="settings-grid">
            {/* 基本設定 */}
            <div className="setting-group">
              <h4>基本設定</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.realtimeMode}
                    onChange={(e) => handleToggle('realtimeMode', e.target.checked)}
                  />
                  <span>リアルタイムカウント</span>
                </label>
                <div className="setting-description">
                  入力中に自動で文字数をカウントします
                </div>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleToggle('autoSave', e.target.checked)}
                  />
                  <span>自動保存</span>
                </label>
                <div className="setting-description">
                  入力テキストを自動で保存します
                </div>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.showCharacterFrequency}
                    onChange={(e) => handleToggle('showCharacterFrequency', e.target.checked)}
                  />
                  <span>文字頻度表示</span>
                </label>
                <div className="setting-description">
                  文字の出現頻度を表示します
                </div>
              </div>
            </div>

            {/* カウント設定 */}
            <div className="setting-group">
              <h4>カウント設定</h4>
              
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
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.excludeSpaces}
                    onChange={(e) => handleToggle('excludeSpaces', e.target.checked)}
                  />
                  <span>空白・タブを除外</span>
                </label>
                <div className="setting-description">
                  スペース、全角スペース、タブを除外してカウントします
                </div>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.useManuscriptRules}
                    onChange={(e) => handleToggle('useManuscriptRules', e.target.checked)}
                  />
                  <span>原稿用紙ルール適用</span>
                </label>
                <div className="setting-description">
                  句読点や記号の原稿用紙ルールを適用します
                </div>
              </div>
            </div>

            {/* 正規化設定 */}
            <div className="setting-group">
              <h4>正規化設定</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <span>文字正規化:</span>
                  <select
                    value={settings.normalization}
                    onChange={(e) => handleSelectChange('normalization', e.target.value)}
                  >
                    <option value="none">変更しない</option>
                    <option value="NFC">NFC</option>
                    <option value="NFKC">NFKC</option>
                  </select>
                </label>
                <div className="setting-description">
                  文字の正規化方法を選択します
                </div>
              </div>
            </div>

            {/* 表示設定 */}
            <div className="setting-group">
              <h4>表示設定</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.displayFormat.useThousandsSeparator}
                    onChange={(e) => handleNestedToggle('displayFormat', 'useThousandsSeparator', e.target.checked)}
                  />
                  <span>桁区切り表示</span>
                </label>
                <div className="setting-description">
                  大きな数値を桁区切りで表示します
                </div>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.displayFormat.showUnits}
                    onChange={(e) => handleNestedToggle('displayFormat', 'showUnits', e.target.checked)}
                  />
                  <span>単位表示</span>
                </label>
                <div className="setting-description">
                  数値に単位を表示します
                </div>
              </div>
            </div>

            {/* パフォーマンス設定 */}
            <div className="setting-group">
              <h4>パフォーマンス設定</h4>
              
              <div className="setting-item">
                <label className="setting-label">
                  <span>デバウンス遅延 (ms):</span>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="100"
                    value={settings.debounceDelay}
                    onChange={(e) => handleNumberChange('debounceDelay', e.target.value)}
                    className="number-input"
                  />
                </label>
                <div className="setting-description">
                  リアルタイムカウントの遅延時間を設定します
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel; 