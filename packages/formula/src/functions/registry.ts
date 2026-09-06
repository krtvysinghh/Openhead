import { FunctionImplementation } from '../types';
import { mathFunctions } from './math';
import { logicalFunctions } from './logical';
import { textFunctions } from './text';
import { lookupFunctions } from './lookup';
import { datetimeFunctions } from './datetime';
import { statsFunctions } from './stats';
import { financialFunctions } from './financial';
import { engineeringFunctions } from './engineering';
import { databaseFunctions } from './database';
import { dynamicFunctions } from './dynamic';
import { infoFunctions } from './info';

export class FunctionRegistry {
  private functions = new Map<string, FunctionImplementation>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const all = [
      ...mathFunctions,
      ...logicalFunctions,
      ...textFunctions,
      ...lookupFunctions,
      ...datetimeFunctions,
      ...statsFunctions,
      ...financialFunctions,
      ...engineeringFunctions,
      ...databaseFunctions,
      ...dynamicFunctions,
      ...infoFunctions,
    ];
    for (const fn of all) {
      this.register(fn);
    }
  }

  public register(fn: FunctionImplementation): void {
    this.functions.set(fn.name.toUpperCase(), fn);
  }

  public get(name: string): FunctionImplementation | undefined {
    return this.functions.get(name.toUpperCase());
  }

  public has(name: string): boolean {
    return this.functions.has(name.toUpperCase());
  }

  public list(): string[] {
    return Array.from(this.functions.keys()).sort();
  }
}

export const defaultFunctionRegistry = new FunctionRegistry();
