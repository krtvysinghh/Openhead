import { Lexer } from './lexer';
import {
  ASTNode,
  Token,
  TokenType,
  CellReferenceNode,
  RangeReferenceNode,
  NumberLiteralNode,
  StringLiteralNode,
  BooleanLiteralNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  FunctionCallNode,
} from './types';
import { parseCellAddress, parseRangeAddress } from './coords';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public static parse(formula: string): ASTNode {
    const lexer = new Lexer(formula);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parseExpression();
  }

  public parseExpression(): ASTNode {
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let expr = this.parseConcat();

    while (this.matchOperator('=', '<>', '<', '<=', '>', '>=')) {
      const operator = this.previous().value;
      const right = this.parseConcat();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
      } as BinaryExpressionNode;
    }

    return expr;
  }

  private parseConcat(): ASTNode {
    let expr = this.parseAdditive();

    while (this.matchOperator('&')) {
      const operator = this.previous().value;
      const right = this.parseAdditive();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
      } as BinaryExpressionNode;
    }

    return expr;
  }

  private parseAdditive(): ASTNode {
    let expr = this.parseMultiplicative();

    while (this.matchOperator('+', '-')) {
      const operator = this.previous().value;
      const right = this.parseMultiplicative();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
      } as BinaryExpressionNode;
    }

    return expr;
  }

  private parseMultiplicative(): ASTNode {
    let expr = this.parseExponentiation();

    while (this.matchOperator('*', '/')) {
      const operator = this.previous().value;
      const right = this.parseExponentiation();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
      } as BinaryExpressionNode;
    }

    return expr;
  }

  private parseExponentiation(): ASTNode {
    let expr = this.parseUnary();

    while (this.matchOperator('^')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
      } as BinaryExpressionNode;
    }

    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.matchOperator('-', '+')) {
      const operator = this.previous().value;
      const argument = this.parseUnary();
      return {
        type: 'UnaryExpression',
        operator,
        argument,
      } as UnaryExpressionNode;
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression.");
      return expr;
    }

    // Number literal
    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'NumberLiteral',
        value: parseFloat(this.previous().value),
      } as NumberLiteralNode;
    }

    // String literal
    if (this.match(TokenType.STRING)) {
      return {
        type: 'StringLiteral',
        value: this.previous().value,
      } as StringLiteralNode;
    }

    // Boolean literal
    if (this.match(TokenType.BOOLEAN)) {
      return {
        type: 'BooleanLiteral',
        value: this.previous().value === 'TRUE',
      } as BooleanLiteralNode;
    }

    // Function call
    if (this.check(TokenType.IDENTIFIER) && this.checkNext(TokenType.LPAREN)) {
      const name = this.advance().value;
      this.advance(); // consume LPAREN
      const args: ASTNode[] = [];
      if (!this.check(TokenType.RPAREN)) {
        do {
          args.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, `Expected ')' after function arguments for ${name}.`);
      return {
        type: 'FunctionCall',
        name,
        args,
      } as FunctionCallNode;
    }

    // Cell Reference or Range Reference
    if (this.match(TokenType.CELL_REF)) {
      const startRef = this.previous().value;
      if (this.match(TokenType.COLON)) {
        if (!this.match(TokenType.CELL_REF)) {
          throw new Error(`Expected cell reference after ':' in range.`);
        }
        const endRef = this.previous().value;
        const rangeStr = `${startRef}:${endRef}`;
        const range = parseRangeAddress(rangeStr);
        if (!range) throw new Error(`Invalid range: ${rangeStr}`);
        return {
          type: 'RangeReference',
          range,
          raw: rangeStr,
        } as RangeReferenceNode;
      }

      const addr = parseCellAddress(startRef);
      if (!addr) throw new Error(`Invalid cell address: ${startRef}`);
      return {
        type: 'CellReference',
        address: addr,
        raw: startRef,
      } as CellReferenceNode;
    }

    throw new Error(`Unexpected token '${this.peek().value}' at position ${this.peek().position}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchOperator(...operators: string[]): boolean {
    if (this.check(TokenType.OPERATOR) && operators.includes(this.peek().value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(message);
  }
}
