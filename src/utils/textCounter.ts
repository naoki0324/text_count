import { encode } from 'encoding-japanese';

const _textEncoder = new TextEncoder();
const _spaceCharRegex = /[\s\u3000]/;

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
  excludeCharacters: string;
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
    let normalizedText = text;
    if (options.excludeCharacters) {
      const excludeSet = new Set(options.excludeCharacters);
      normalizedText = [...text].filter((char) => !excludeSet.has(char)).join('');
    }

    const totalCharacters = normalizedText.length;
    const { lines, totalCharactersNoNewlines, charactersExcludingSpaces } =
      this.countBasicMetrics(normalizedText);
    const bytes = this.calculateBytes(normalizedText);
    const manuscriptPages = this.calculateManuscriptPages(normalizedText);
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

  private static countBasicMetrics(text: string): {
    lines: number;
    totalCharactersNoNewlines: number;
    charactersExcludingSpaces: number;
  } {
    if (!text) return { lines: 0, totalCharactersNoNewlines: 0, charactersExcludingSpaces: 0 };

    let newlineCount = 0;
    let spaceCount = 0;
    let lines = 0;
    let currentLineHasContent = false;
    let prevChar = '';

    for (const char of text) {
      if (char === '\n') {
        newlineCount++;
        spaceCount++;
        if (prevChar !== '\r') {
          if (currentLineHasContent) lines++;
          currentLineHasContent = false;
        }
      } else if (char === '\r') {
        newlineCount++;
        spaceCount++;
        if (currentLineHasContent) lines++;
        currentLineHasContent = false;
      } else {
        if (_spaceCharRegex.test(char)) spaceCount++;
        currentLineHasContent = true;
      }
      prevChar = char;
    }
    if (currentLineHasContent) lines++;

    return {
      lines,
      totalCharactersNoNewlines: text.length - newlineCount,
      charactersExcludingSpaces: text.length - spaceCount,
    };
  }

  private static calculateBytes(text: string): TextCountResult['bytes'] {
    // UTF-8
    const utf8Bytes = _textEncoder.encode(text).length;
    
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

  private static calculateManuscriptPages(text: string): number {
    // 原稿用紙ルール適用（固定）
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
