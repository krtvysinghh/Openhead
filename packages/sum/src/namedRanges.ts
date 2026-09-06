import { CellRangeAddress, parseRangeAddress } from '@openhead/formula';

export interface NamedRange {
  name: string;
  range: CellRangeAddress;
  scope?: string;
}

export class NamedRangesManager {
  private ranges = new Map<string, NamedRange>();

  public define(name: string, rangeStr: string, scope?: string): boolean {
    const range = parseRangeAddress(rangeStr);
    if (!range) return false;
    this.ranges.set(name.toUpperCase(), { name, range, scope });
    return true;
  }

  public get(name: string): NamedRange | undefined {
    return this.ranges.get(name.toUpperCase());
  }

  public remove(name: string): boolean {
    return this.ranges.delete(name.toUpperCase());
  }

  public list(): NamedRange[] {
    return Array.from(this.ranges.values());
  }
}
