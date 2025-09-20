import React, { useRef, useCallback } from 'react';
import { FileUtils } from '../utils/fileUtils';
import './TextInput.css';

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  onFileDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  dragActive: boolean;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onFileDrop,
  onDragOver,
  onDragLeave,
  dragActive,
  placeholder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = FileUtils.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const content = await FileUtils.importTextFile(file);
      onChange(content);
    } catch (error) {
      alert('ファイルの読み込みに失敗しました');
      console.error('File import error:', error);
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('text') !== -1) {
        item.getAsString((text) => {
          onChange(text);
        });
        break;
      }
    }
  }, [onChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter でフォーカスを外す
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      textareaRef.current?.blur();
    }
    
    // Ctrl/Cmd + L で全選択
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault();
      textareaRef.current?.select();
    }
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleExportClick = useCallback(() => {
    if (value.trim()) {
      FileUtils.exportTextFile(value, 'text.txt');
    }
  }, [value]);

  return (
    <div className="text-input-container">
      <div className="text-input-header">
        <h3>テキスト入力</h3>
        <div className="file-actions">
          <button 
            className="import-button"
            onClick={handleImportClick}
            type="button"
          >
            ファイル読み込み
          </button>
          <button 
            className="export-button"
            onClick={handleExportClick}
            disabled={!value.trim()}
            type="button"
          >
            テキスト保存
          </button>
        </div>
      </div>

      <div 
        className={`text-input-area ${dragActive ? 'drag-active' : ''}`}
        onDrop={onFileDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="text-input-textarea"
          rows={15}
          maxLength={1000000} // 100万文字制限
        />
        
        {dragActive && (
          <div className="drag-overlay">
            <div className="drag-message">
              <div className="drag-icon">📁</div>
              <div>ファイルをドロップして読み込み</div>
            </div>
          </div>
        )}
      </div>

      <div className="text-input-footer">
        <div className="character-count">
          {value.length.toLocaleString('ja-JP')} 文字
        </div>
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TextInput; 