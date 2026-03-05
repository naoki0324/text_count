# 文字数カウントツール

ブラウザ上で動作する文字数カウントツールです。入力したテキストの文字数・行数・UTF-8バイト数・原稿用紙換算を即時に確認できます。

## 🚀 特徴

- **リアルタイムカウント**: 入力と同時に結果が更新
- **シンプルな設定**: 改行の扱い、除外文字のみ
- **ファイル操作**: .txtの読み込み/保存
- **原稿用紙換算**: 400字詰めの一般的なルールに基づく換算
- **モダンUI**: クリーム基調で1画面完結

## 📋 機能一覧

- 総文字数（改行含む/含まない）
- 空白除く文字数
- 行数
- 原稿用紙換算（400字詰め）
- UTF-8バイト数

## ⚙️ 設定

- **改行を文字数に含める**
- **カウントから除外する文字**（入力した文字はすべて除外）

## 🖥️ 画面レイアウト

- 左: テキスト入力
- 右上: カウント結果
- 右下: 設定

## 🛠️ 技術仕様

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite 7
- **依存ライブラリ**: encoding-japanese（日本語エンコーディング対応）

## 📝 更新履歴

### 2026-03-06
- **セキュリティ対応**: 依存パッケージの脆弱性 10件を修正（moderate 3件、high 7件 → 0件）
  - `vite` v5 → v7（esbuild の開発サーバークロスオリジン脆弱性を解消）
  - `@typescript-eslint/eslint-plugin` / `@typescript-eslint/parser` v6 → v8（minimatch ReDoS 脆弱性を解消）
  - `@vitejs/plugin-react` v4.2 → v4.3（vite v7 対応）
- **パフォーマンス改善**: キーストローク処理の効率化
  - `TextEncoder` をモジュールレベルのシングルトン化（毎カウントのインスタンス化を排除）
  - 文字数カウントの文字列スキャンを5回→1回に統合（`countBasicMetrics` による単一パス処理）
  - `localStorage` へのテキスト保存を毎キーストロークから250msデバウンスに変更
  - debounce関数を `useRef` で安定化（設定変更時のタイマードロップを修正）

## 🚀 セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn

### インストールと起動

```bash
npm install
npm run dev
```

デフォルトは `http://localhost:5173` で起動します。`3000` で起動する場合:

```bash
npm run dev -- --port 3000
```

### ビルド/プレビュー

```bash
npm run build
npm run preview
```

## 📱 使用方法

1. テキストを入力、または .txt を読み込み
2. 右側に結果が表示されます
3. 必要に応じて設定を調整

## ⌨️ キーボードショートカット

- `Ctrl/Cmd + Enter`: フォーカスを外す
- `Ctrl/Cmd + L`: テキストを全選択
- `Escape`: ヘルプを閉じる

## 📁 プロジェクト構造

```
text_count/
├── src/
│   ├── components/
│   │   ├── TextInput.tsx
│   │   ├── CountResults.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── HelpModal.tsx
│   ├── utils/
│   │   ├── textCounter.ts
│   │   ├── settings.ts
│   │   └── fileUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── README.md
```
