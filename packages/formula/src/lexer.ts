import { Token, TokenType } from './types';

export class Lexer {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    this.input = input.startsWith('=') ? input.slice(1).trim() : input.trim();
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];
      const startPos = this.pos;

      // String literal
      if (char === '"') {
        tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek(1)))) {
        tokens.push(this.readNumber());
        continue;
      }

      // Multi-character operators: <=, >=, <>
      if (this.pos + 1 < this.input.length) {
        const twoChar = this.input.substring(this.pos, this.pos + 2);
        if (['<=', '>=', '<>'].includes(twoChar)) {
          tokens.push({ type: TokenType.OPERATOR, value: twoChar, position: startPos });
          this.pos += 2;
          continue;
        }
      }

      // Single-character operators
      if (['+', '-', '*', '/', '^', '&', '=', '<', '>'].includes(char)) {
        tokens.push({ type: TokenType.OPERATOR, value: char, position: startPos });
        this.pos++;
        continue;
      }

      // Symbols
      if (char === '(') {
        tokens.push({ type: TokenType.LPAREN, value: '(', position: startPos });
        this.pos++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: TokenType.RPAREN, value: ')', position: startPos });
        this.pos++;
        continue;
      }
      if (char === ',') {
        tokens.push({ type: TokenType.COMMA, value: ',', position: startPos });
        this.pos++;
        continue;
      }
      if (char === ':') {
        tokens.push({ type: TokenType.COLON, value: ':', position: startPos });
        this.pos++;
        continue;
      }

      // Identifiers, Cell references, Boolean literals
      if (this.isAlpha(char) || char === '$' || char === '_') {
        tokens.push(this.readIdentifierOrCellRef());
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${this.pos}`);
    }

    tokens.push({ type: TokenType.EOF, value: '', position: this.pos });
    return tokens;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private peek(offset: number = 0): string {
    return this.pos + offset < this.input.length ? this.input[this.pos + offset] : '';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private readString(): Token {
    const start = this.pos;
    this.pos++; // skip opening quote
    let str = '';
    while (this.pos < this.input.length) {
      if (this.input[this.pos] === '"') {
        if (this.peek(1) === '"') {
          str += '"';
          this.pos += 2;
        } else {
          this.pos++; // skip closing quote
          break;
        }
      } else {
        str += this.input[this.pos];
        this.pos++;
      }
    }
    return { type: TokenType.STRING, value: str, position: start };
  }

  private readNumber(): Token {
    const start = this.pos;
    let hasDot = false;
    while (this.pos < this.input.length) {
      const c = this.input[this.pos];
      if (this.isDigit(c)) {
        this.pos++;
      } else if (c === '.' && !hasDot) {
        hasDot = true;
        this.pos++;
      } else {
        break;
      }
    }
    return {
      type: TokenType.NUMBER,
      value: this.input.substring(start, this.pos),
      position: start,
    };
  }

  private readIdentifierOrCellRef(): Token {
    const start = this.pos;
    while (
      this.pos < this.input.length &&
      (this.isAlpha(this.input[this.pos]) ||
        this.isDigit(this.input[this.pos]) ||
        this.input[this.pos] === '$' ||
        this.input[this.pos] === '_' ||
        this.input[this.pos] === '!')
    ) {
      this.pos++;
    }

    const value = this.input.substring(start, this.pos);
    const upper = value.toUpperCase();

    if (upper === 'TRUE' || upper === 'FALSE') {
      return { type: TokenType.BOOLEAN, value: upper, position: start };
    }

    // Check if it's a cell reference like A1 or $A$1
    const isCellRef = /^([A-Za-z0-9_]+!)?\$?[A-Za-z]+\$?[0-9]+$/.test(value);
    if (isCellRef) {
      return { type: TokenType.CELL_REF, value, position: start };
    }

    return { type: TokenType.IDENTIFIER, value: upper, position: start };
  }
}
