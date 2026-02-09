import React, { useEffect } from 'react';
import './HelpModal.css';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="help-modal-backdrop" onClick={handleBackdropClick}>
      <div className="help-modal">
        <div className="help-modal-header">
          <h2>ヘルプ</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="help-modal-content">
          <div className="help-section">
            <h3>📊 文字数の定義</h3>
            <p>
              このツールでは、文字数を<strong>Unicodeコードポイント数</strong>としてカウントします。
            </p>
            <ul>
              <li>サロゲートペア（絵文字、異体字）は1文字としてカウント</li>
              <li>結合文字（例：e + ́）は複数のコードポイントとしてカウント</li>
              <li>絵文字バリアント選択子（U+FE0F）やZWJ（U+200D）も個別にカウント</li>
            </ul>
            <p className="note">
              ※ 視覚的に1文字に見える場合でも、複数のコードポイントとしてカウントされる場合があります
            </p>
          </div>

          <div className="help-section">
            <h3>📝 原稿用紙換算ルール</h3>
            <p>400字詰め原稿用紙の一般的なルールに基づいて計算します：</p>
            <ul>
              <li>句読点（、。）：1マス</li>
              <li>かぎ括弧（「」『』〈〉（ ）【】など）：各1マス</li>
              <li>三点リーダー（…）・ダッシュ（―）：2つで2マス</li>
              <li>促音・拗音（っゃゅょ等）：1マス</li>
              <li>英数字・記号：半角1文字=1マス、全角1文字=1マス</li>
              <li>改行：マス加算なし（文字数としてはカウント）</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🔤 エンコーディング別バイト数</h3>
            <p>以下のエンコーディングでのバイト数を表示します：</p>
            <ul>
              <li><strong>UTF-8</strong>：可変長エンコーディング、Web標準</li>
              <li><strong>UTF-16LE/BE</strong>：16ビット固定長、リトルエンディアン/ビッグエンディアン</li>
              <li><strong>Shift_JIS</strong>：日本語Windows標準</li>
              <li><strong>EUC-JP</strong>：Unix系システム標準</li>
              <li><strong>ISO-2022-JP</strong>：電子メール標準（JIS）</li>
            </ul>
            <p className="note">
              ※ 一部の文字は特定のエンコーディングで表現できない場合があります
            </p>
          </div>

          <div className="help-section">
            <h3>⚙️ 設定項目の説明</h3>
            <ul>
              <li><strong>改行を文字数に含める</strong>：改行文字を文字数に含めるかどうか</li>
              <li><strong>カウントから除外する文字</strong>：指定した文字をすべてカウント対象から除外</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>⌨️ キーボードショートカット</h3>
            <ul>
              <li><strong>Ctrl/Cmd + Enter</strong>：フォーカスを外す</li>
              <li><strong>Ctrl/Cmd + L</strong>：テキストを全選択</li>
              <li><strong>Escape</strong>：ヘルプを閉じる</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>📁 ファイル操作</h3>
            <ul>
              <li><strong>ドラッグ&ドロップ</strong>：テキストファイル（.txt）をドロップして読み込み</li>
              <li><strong>ファイル読み込み</strong>：ローカルファイルを選択して読み込み</li>
              <li><strong>テキスト保存</strong>：入力テキストを.txtファイルとして保存</li>
              <li><strong>結果エクスポート</strong>：カウント結果をテキストファイルとして保存</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>💡 使用例</h3>
            <div className="example-text">
              <p><strong>小説・論文</strong>：原稿用紙換算で分量の目安を確認</p>
              <p><strong>SNS投稿</strong>：文字数制限の確認、除外文字で実際の文字数を調整</p>
              <p><strong>技術文書</strong>：各種エンコーディングでのバイト数確認</p>
              <p><strong>翻訳作業</strong>：文字数ベースの翻訳料金計算</p>
            </div>
          </div>
        </div>

        <div className="help-modal-footer">
          <button 
            className="close-button-large"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 
