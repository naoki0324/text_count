export class FileUtils {
  static async importTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file as text'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  static exportTextFile(content: string, filename: string = 'text.txt'): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static exportCountResult(result: any, filename: string = 'count-result.txt'): void {
    const content = this.formatCountResult(result);
    this.exportTextFile(content, filename);
  }

  private static formatCountResult(result: any): string {
    const lines = [
      '文字数カウント結果',
      '================',
      '',
      `総文字数: ${result.totalCharacters.toLocaleString('ja-JP')}`,
      `改行除く文字数: ${result.totalCharactersNoNewlines.toLocaleString('ja-JP')}`,
      `空白除く文字数: ${result.charactersExcludingSpaces.toLocaleString('ja-JP')}`,
      `行数: ${result.lines.toLocaleString('ja-JP')}`,
      `原稿用紙換算: ${result.manuscriptPages} 枚`,
      '',
      'バイト数:',
      `  UTF-8: ${result.bytes.utf8.toLocaleString('ja-JP')} bytes`,
      `  UTF-16LE: ${result.bytes.utf16le.toLocaleString('ja-JP')} bytes`,
      `  UTF-16BE: ${result.bytes.utf16be.toLocaleString('ja-JP')} bytes`,
      `  Shift_JIS: ${result.bytes.shiftJis.toLocaleString('ja-JP')} bytes`,
      `  EUC-JP: ${result.bytes.eucJp.toLocaleString('ja-JP')} bytes`,
      `  ISO-2022-JP: ${result.bytes.iso2022Jp.toLocaleString('ja-JP')} bytes`,
      '',
      `計測日時: ${new Date().toLocaleString('ja-JP')}`
    ];
    
    return lines.join('\n');
  }

  static handleFileDrop(event: DragEvent): File | null {
    event.preventDefault();
    
    if (!event.dataTransfer) return null;
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return null;
    
    const file = files[0];
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      return null;
    }
    
    return file;
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > 10 * 1024 * 1024) { // 10MB制限
      return { valid: false, error: 'ファイルサイズが大きすぎます（10MB以下）' };
    }
    
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      return { valid: false, error: 'テキストファイル（.txt）のみ対応しています' };
    }
    
    return { valid: true };
  }
} 