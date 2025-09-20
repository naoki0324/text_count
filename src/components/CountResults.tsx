import React, { useState } from 'react';
import { TextCountResult, TextCounter } from '../utils/textCounter';
import { AppSettings } from '../utils/settings';
import './CountResults.css';

interface CountResultsProps {
  result: TextCountResult | null;
  isCalculating: boolean;
  onCopy: () => void;
  onExport: () => void;
  settings: AppSettings;
}

const CountResults: React.FC<CountResultsProps> = ({
  result,
  isCalculating,
  onCopy,
  onExport,
  settings
}) => {
  const [expandedSections, setExpandedSections] = useState({
    bytes: false,
    frequency: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isCalculating) {
    return (
      <div className="count-results">
        <div className="results-header">
          <h3>カウント結果</h3>
        </div>
        <div className="calculating-indicator">
          <div className="spinner"></div>
          <div>計算中...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="count-results">
        <div className="results-header">
          <h3>カウント結果</h3>
        </div>
        <div className="no-results">
          <div className="no-results-icon">📊</div>
          <div>テキストを入力してカウントを実行してください</div>
        </div>
      </div>
    );
  }

  const topCharacters = TextCounter.getTopCharacters(result.characterFrequency, 10);

  return (
    <div className="count-results">
      <div className="results-header">
        <h3>カウント結果</h3>
        <div className="result-actions">
          <button 
            className="copy-button"
            onClick={onCopy}
            title="結果をコピー"
          >
            📋
          </button>
          <button 
            className="export-button"
            onClick={onExport}
            title="結果をエクスポート"
          >
            💾
          </button>
        </div>
      </div>

      <div className="results-content">
        {/* 主要指標 */}
        <div className="main-metrics">
          <div className="metric-card primary">
            <div className="metric-value">
              {settings.displayFormat.useThousandsSeparator 
                ? TextCounter.formatNumber(result.totalCharacters)
                : result.totalCharacters
              }
            </div>
            <div className="metric-label">
              総文字数
              {settings.displayFormat.showUnits && ' (文字)'}
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {settings.displayFormat.useThousandsSeparator 
                ? TextCounter.formatNumber(result.lines)
                : result.lines
              }
            </div>
            <div className="metric-label">
              行数
              {settings.displayFormat.showUnits && ' (行)'}
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {result.manuscriptPages}
            </div>
            <div className="metric-label">
              原稿用紙換算
              {settings.displayFormat.showUnits && ' (枚)'}
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {settings.displayFormat.useThousandsSeparator 
                ? TextCounter.formatNumber(result.bytes.utf8)
                : result.bytes.utf8
              }
            </div>
            <div className="metric-label">
              UTF-8
              {settings.displayFormat.showUnits && ' (bytes)'}
            </div>
          </div>
        </div>

        {/* 詳細指標 */}
        <div className="detailed-metrics">
          <div className="metric-row">
            <span className="metric-label">改行除く文字数:</span>
            <span className="metric-value">
              {settings.displayFormat.useThousandsSeparator 
                ? TextCounter.formatNumber(result.totalCharactersNoNewlines)
                : result.totalCharactersNoNewlines
              }
            </span>
          </div>

          <div className="metric-row">
            <span className="metric-label">空白除く文字数:</span>
            <span className="metric-value">
              {settings.displayFormat.useThousandsSeparator 
                ? TextCounter.formatNumber(result.charactersExcludingSpaces)
                : result.charactersExcludingSpaces
              }
            </span>
          </div>
        </div>

        {/* バイト数詳細 */}
        <div className="metric-section">
          <button 
            className="section-toggle"
            onClick={() => toggleSection('bytes')}
          >
            <span>バイト数詳細</span>
            <span className="toggle-icon">
              {expandedSections.bytes ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.bytes && (
            <div className="section-content">
              <div className="bytes-grid">
                <div className="byte-item">
                  <span className="encoding-name">UTF-16LE:</span>
                  <span className="byte-value">
                    {settings.displayFormat.useThousandsSeparator 
                      ? TextCounter.formatNumber(result.bytes.utf16le)
                      : result.bytes.utf16le
                    }
                  </span>
                </div>
                <div className="byte-item">
                  <span className="encoding-name">UTF-16BE:</span>
                  <span className="byte-value">
                    {settings.displayFormat.useThousandsSeparator 
                      ? TextCounter.formatNumber(result.bytes.utf16be)
                      : result.bytes.utf16be
                    }
                  </span>
                </div>
                <div className="byte-item">
                  <span className="encoding-name">Shift_JIS:</span>
                  <span className="byte-value">
                    {settings.displayFormat.useThousandsSeparator 
                      ? TextCounter.formatNumber(result.bytes.shiftJis)
                      : result.bytes.shiftJis
                    }
                  </span>
                </div>
                <div className="byte-item">
                  <span className="encoding-name">EUC-JP:</span>
                  <span className="byte-value">
                    {settings.displayFormat.useThousandsSeparator 
                      ? TextCounter.formatNumber(result.bytes.eucJp)
                      : result.bytes.eucJp
                    }
                  </span>
                </div>
                <div className="byte-item">
                  <span className="encoding-name">ISO-2022-JP:</span>
                  <span className="byte-value">
                    {settings.displayFormat.useThousandsSeparator 
                      ? TextCounter.formatNumber(result.bytes.iso2022Jp)
                      : result.bytes.iso2022Jp
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 文字頻度 */}
        {settings.showCharacterFrequency && (
          <div className="metric-section">
            <button 
              className="section-toggle"
              onClick={() => toggleSection('frequency')}
            >
              <span>文字頻度 (上位10文字)</span>
              <span className="toggle-icon">
                {expandedSections.frequency ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSections.frequency && (
              <div className="section-content">
                <div className="frequency-list">
                  {topCharacters.map((item, index) => (
                    <div key={index} className="frequency-item">
                      <span className="char">{item.char}</span>
                      <span className="count">
                        {settings.displayFormat.useThousandsSeparator 
                          ? TextCounter.formatNumber(item.count)
                          : item.count
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountResults; 