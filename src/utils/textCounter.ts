import { encode } from 'encoding-japanese';

export interface TextCountResult {
  totalCharacters: number;
  totalCharactersNoNewlines: number;
  charactersExcludingSpaces: number;
  lines: number;
  bytes: {
    utf8: number;
    utf16le: number;
    utf16be: number;
    shiftJis: number;
    eucJp: number;
    iso2022Jp: number;
  };
  manuscriptPages: number;
  characterFrequency: Record<string, number>;
}

export interface CountOptions {
  includeNewlines: boolean;
  excludeSpaces: boolean;
  useManuscriptRules: boolean;
  normalization: 'none' | 'NFC' | 'NFKC';
}

export class TextCounter {
  private static readonly MANUSCRIPT_CHAR_MAP: Record<string, number> = {
    '、': 1, '。': 1, '，': 1, '．': 1,
    '「': 1, '」': 1, '『': 1, '』': 1,
    '〈': 1, '〉': 1, '（': 1, '）': 1,
    '【': 1, '】': 1, '［': 1, '］': 1,
    '｛': 1, '｝': 1, '＜': 1, '＞': 1,
    '…': 2, '―': 2, '‥': 2, '──': 2,
    'っ': 1, 'ゃ': 1, 'ゅ': 1, 'ょ': 1,
    'ァ': 1, 'ィ': 1, 'ゥ': 1, 'ェ': 1, 'ォ': 1,
    'ャ': 1, 'ュ': 1, 'ョ': 1
  };

  static countText(text: string, options: CountOptions): TextCountResult {
    // 正規化
    let normalizedText = text;
    if (options.normalization === 'NFC') {
      normalizedText = text.normalize('NFC');
    } else if (options.normalization === 'NFKC') {
      normalizedText = text.normalize('NFKC');
    }

    // 基本カウント
    const totalCharacters = normalizedText.length;
    const totalCharactersNoNewlines = normalizedText.replace(/[\r\n]/g, '').length;
    
    // 行数カウント
    const lines = this.countLines(normalizedText);
    
    // 空白除外カウント
    let charactersExcludingSpaces = totalCharacters;
    if (options.excludeSpaces) {
      charactersExcludingSpaces = normalizedText.replace(/[\s\t\u3000]/g, '').length;
    }
    
    // バイト数計算
    const bytes = this.calculateBytes(normalizedText);
    
    // 原稿用紙換算
    const manuscriptPages = this.calculateManuscriptPages(normalizedText, options.useManuscriptRules);
    
    // 文字頻度
    const characterFrequency = this.calculateCharacterFrequency(normalizedText);

    return {
      totalCharacters: options.includeNewlines ? totalCharacters : totalCharactersNoNewlines,
      totalCharactersNoNewlines,
      charactersExcludingSpaces,
      lines,
      bytes,
      manuscriptPages,
      characterFrequency
    };
  }

  private static countLines(text: string): number {
    if (!text) return 0;
    const lines = text.split(/\r\n|\r|\n/);
    // 末尾の空行を除外
    return lines.filter(line => line.length > 0).length;
  }

  private static calculateBytes(text: string): TextCountResult['bytes'] {
    // UTF-8
    const utf8Bytes = new TextEncoder().encode(text).length;
    
    // UTF-16LE
    const utf16leBytes = text.length * 2;
    
    // UTF-16BE
    const utf16beBytes = text.length * 2;
    
    // Shift_JIS, EUC-JP, ISO-2022-JP
    let shiftJisBytes = 0;
    let eucJpBytes = 0;
    let iso2022JpBytes = 0;
    
    try {
      const shiftJisArray = encode(text, 'SJIS');
      shiftJisBytes = shiftJisArray.length;
      
      const eucJpArray = encode(text, 'EUCJP');
      eucJpBytes = eucJpArray.length;
      
      const iso2022JpArray = encode(text, 'JIS');
      iso2022JpBytes = iso2022JpArray.length;
    } catch (error) {
      console.warn('Encoding calculation error:', error);
      // エラーの場合は0を設定
      shiftJisBytes = 0;
      eucJpBytes = 0;
      iso2022JpBytes = 0;
    }

    return {
      utf8: utf8Bytes,
      utf16le: utf16leBytes,
      utf16be: utf16beBytes,
      shiftJis: shiftJisBytes,
      eucJp: eucJpBytes,
      iso2022Jp: iso2022JpBytes
    };
  }

  private static calculateManuscriptPages(text: string, useManuscriptRules: boolean): number {
    if (!useManuscriptRules) {
      // 通常の400字詰め計算
      const charCount = text.replace(/[\r\n]/g, '').length;
      return Math.round((charCount / 400) * 10) / 10; // 小数第2位四捨五入
    }

    // 原稿用紙ルール適用
    let manuscriptCharCount = 0;
    
    for (const char of text) {
      if (char === '\r' || char === '\n') {
        continue; // 改行はマス加算なし
      }
      
      if (this.MANUSCRIPT_CHAR_MAP[char]) {
        manuscriptCharCount += this.MANUSCRIPT_CHAR_MAP[char];
      } else if (char.charCodeAt(0) <= 0x7F) {
        // ASCII文字（半角）
        manuscriptCharCount += 1;
      } else {
        // その他（全角）
        manuscriptCharCount += 1;
      }
    }
    
    return Math.round((manuscriptCharCount / 400) * 10) / 10; // 小数第2位四捨五入
  }

  private static calculateCharacterFrequency(text: string): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    for (const char of text) {
      if (char === '\r' || char === '\n') continue; // 改行は除外
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    return frequency;
  }

  static getTopCharacters(frequency: Record<string, number>, topN: number = 10): Array<{char: string, count: number}> {
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, topN)
      .map(([char, count]) => ({ char, count }));
  }

  static formatNumber(num: number): string {
    return num.toLocaleString('ja-JP');
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
} 