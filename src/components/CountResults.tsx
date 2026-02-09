import React from 'react';
import { TextCountResult, TextCounter } from '../utils/textCounter';
import './CountResults.css';

interface CountResultsProps {
  result: TextCountResult | null;
  isCalculating: boolean;
}

const CountResults: React.FC<CountResultsProps> = ({
  result,
  isCalculating
}) => {
  if (isCalculating) {
    return (
      <div className="count-results">
        <div className="calculating-indicator">
          <div className="spinner"></div>
          <div>計算中...</div>
        </div>
      </div>
    );
  }

  const safeResult: TextCountResult = result ?? {
    totalCharacters: 0,
    totalCharactersNoNewlines: 0,
    charactersExcludingSpaces: 0,
    lines: 0,
    bytes: {
      utf8: 0,
      utf16le: 0,
      utf16be: 0,
      shiftJis: 0,
      eucJp: 0,
      iso2022Jp: 0
    },
    manuscriptPages: 0,
    characterFrequency: {}
  };

  return (
    <div className="count-results">
      <div className="results-content">
        {/* 主要指標 */}
        <div className="main-metrics">
          <div className="metric-card primary">
            <div className="metric-value">
              {TextCounter.formatNumber(safeResult.totalCharacters)}
            </div>
            <div className="metric-label">
              総文字数 (文字)
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {TextCounter.formatNumber(safeResult.lines)}
            </div>
            <div className="metric-label">
              行数 (行)
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {TextCounter.formatNumber(safeResult.manuscriptPages)}
            </div>
            <div className="metric-label">
              原稿用紙換算 (枚)
            </div>
          </div>

          <div className="metric-card primary">
            <div className="metric-value">
              {TextCounter.formatNumber(safeResult.bytes.utf8)}
            </div>
            <div className="metric-label">
              UTF-8 (bytes)
            </div>
          </div>
        </div>

        {/* 詳細指標 */}
        <div className="detailed-metrics">
          <div className="metric-row">
            <span className="metric-label">改行除く文字数:</span>
            <span className="metric-value">
              {TextCounter.formatNumber(safeResult.totalCharactersNoNewlines)}
            </span>
          </div>

          <div className="metric-row">
            <span className="metric-label">空白除く文字数:</span>
            <span className="metric-value">
              {TextCounter.formatNumber(safeResult.charactersExcludingSpaces)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CountResults; 
