import React, { useState, useEffect, useCallback } from 'react';
import { TextCounter, TextCountResult, CountOptions } from './utils/textCounter';
import { SettingsManager, AppSettings } from './utils/settings';
import { FileUtils } from './utils/fileUtils';
import TextInput from './components/TextInput';
import CountResults from './components/CountResults';
import SettingsPanel from './components/SettingsPanel';
import HelpModal from './components/HelpModal';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [countResult, setCountResult] = useState<TextCountResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>(SettingsManager.loadSettings());
  const [isCalculating, setIsCalculating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const debounceDelay = 250;

  // 設定の保存
  useEffect(() => {
    SettingsManager.saveSettings(settings);
  }, [settings]);

  // テキストの自動保存
  useEffect(() => {
    SettingsManager.saveText(text);
  }, [text]);

  // 初期テキストの読み込み
  useEffect(() => {
    const savedText = SettingsManager.loadText();
    if (savedText) {
      setText(savedText);
    }
  }, []);

  // 文字数カウント実行
  const performCount = useCallback(async (inputText: string, countOptions: CountOptions) => {
    if (!inputText.trim()) {
      setCountResult(null);
      return;
    }

    setIsCalculating(true);
    
    try {
      // 大文字列の場合はWeb Workerを使用（将来的な拡張）
      const result = TextCounter.countText(inputText, countOptions);
      setCountResult(result);
    } catch (error) {
      console.error('Count error:', error);
      // エラーハンドリング
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // リアルタイムカウント（デバウンス付き）
  const debouncedCount = useCallback(
    TextCounter.debounce((inputText: string) => {
      performCount(inputText, settings);
    }, debounceDelay),
    [performCount, settings]
  );

  // テキスト変更時の処理
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    
    debouncedCount(newText);
  }, [settings, debouncedCount]);

  // 設定変更
  const handleSettingsChange = useCallback((newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    performCount(text, updatedSettings);
  }, [settings, text, performCount]);

  // ファイルドロップ処理
  const handleFileDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = FileUtils.handleFileDrop(event.nativeEvent);
    if (!file) return;
    
    const validation = FileUtils.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    try {
      const fileContent = await FileUtils.importTextFile(file);
      setText(fileContent);
      
      performCount(fileContent, settings);
    } catch (error) {
      alert('ファイルの読み込みに失敗しました');
      console.error('File import error:', error);
    }
  }, [settings, performCount]);

  // ドラッグイベントハンドラー
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  // クリア処理
  const handleClear = useCallback(() => {
    if (window.confirm('入力テキストとカウント結果をクリアしますか？')) {
      setText('');
      setCountResult(null);
      SettingsManager.saveText('');
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>文字数カウントツール</h1>
        <div className="header-actions">
          <button 
            className="help-button"
            onClick={() => setShowHelp(true)}
            aria-label="ヘルプ"
          >
            ?
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="input-section layout-input">
          <TextInput
            value={text}
            onChange={handleTextChange}
            onFileDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            dragActive={dragActive}
            placeholder="ここにテキストを入力してください..."
          />
          
          <div className="input-actions">
            <button 
              className="clear-button"
              onClick={handleClear}
              disabled={!text.trim()}
            >
              クリア
            </button>
          </div>
        </div>

        <div className="results-section layout-results">
          <CountResults
            result={countResult}
            isCalculating={isCalculating}
          />
        </div>

        <div className="settings-section layout-settings">
          <SettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
          />
        </div>
      </main>

      {showHelp && (
        <HelpModal
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}

export default App; 
