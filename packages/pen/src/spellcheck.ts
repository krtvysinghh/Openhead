export interface SpellCheckResult {
  word: string;
  isCorrect: boolean;
  suggestions: string[];
}

export class SpellCheckEngine {
  private static userDictionary: Set<string> = new Set();
  private static ignoredWords: Set<string> = new Set();

  private static readonly COMMON_DICTIONARY = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'openhead', 'document', 'spreadsheet', 'presentation', 'paragraph', 'section',
    'format', 'style', 'table', 'header', 'footer', 'footnote', 'margin', 'column',
    'formula', 'function', 'calculation', 'filter', 'sort', 'range', 'matrix',
    'slide', 'canvas', 'shape', 'chart', 'presenter', 'transition', 'theme',
  ]);

  /**
   * Checks spelling of a single word.
   */
  public static checkWord(rawWord: string): SpellCheckResult {
    const word = rawWord.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
    if (!word || word.length <= 1 || /^\d+$/.test(word)) {
      return { word: rawWord, isCorrect: true, suggestions: [] };
    }

    if (
      this.COMMON_DICTIONARY.has(word) ||
      this.userDictionary.has(word) ||
      this.ignoredWords.has(word)
    ) {
      return { word: rawWord, isCorrect: true, suggestions: [] };
    }

    const suggestions = this.findSuggestions(word);
    return {
      word: rawWord,
      isCorrect: false,
      suggestions,
    };
  }

  /**
   * Adds a word to the user's custom dictionary.
   */
  public static addToDictionary(word: string): void {
    this.userDictionary.add(word.trim().toLowerCase());
  }

  /**
   * Ignores a word for the current session.
   */
  public static ignoreWord(word: string): void {
    this.ignoredWords.add(word.trim().toLowerCase());
  }

  /**
   * Computes edit-distance suggestions.
   */
  private static findSuggestions(target: string): string[] {
    const candidates: { word: string; distance: number }[] = [];

    for (const dictWord of this.COMMON_DICTIONARY) {
      if (Math.abs(dictWord.length - target.length) <= 2) {
        const dist = this.levenshtein(target, dictWord);
        if (dist <= 2) {
          candidates.push({ word: dictWord, distance: dist });
        }
      }
    }

    return candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((c) => c.word);
  }

  private static levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }

    return d[m][n];
  }
}
