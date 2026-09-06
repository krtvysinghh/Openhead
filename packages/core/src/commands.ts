export type CommandCategory = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'tools' | 'ai' | 'help';

export interface CommandDefinition {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  shortcut?: string;
  icon?: string;
  appScope?: 'global' | 'pen' | 'sum' | 'glimpse';
  isAvailable?: (context: CommandContext) => boolean;
  execute: (context: CommandContext) => void | Promise<void>;
  undo?: (context: CommandContext) => void | Promise<void>;
}

export interface CommandContext {
  activeApp: 'home' | 'pen' | 'sum' | 'glimpse';
  activeDocumentId?: string;
  selectedRange?: string;
  hasSelection?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  appInstance?: any;
}

export class CommandRegistry {
  private static commands: Map<string, CommandDefinition> = new Map();

  public static register(command: CommandDefinition): void {
    this.commands.set(command.id, command);
  }

  public static unregister(commandId: string): void {
    this.commands.delete(commandId);
  }

  public static get(commandId: string): CommandDefinition | undefined {
    return this.commands.get(commandId);
  }

  public static getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  public static getAvailable(context: CommandContext): CommandDefinition[] {
    return this.getAll().filter((cmd) => {
      // Scope filter
      if (cmd.appScope && cmd.appScope !== 'global' && cmd.appScope !== context.activeApp) {
        return false;
      }
      // Availability predicate
      if (cmd.isAvailable) {
        return cmd.isAvailable(context);
      }
      return true;
    });
  }

  public static search(query: string, context: CommandContext): CommandDefinition[] {
    const q = query.trim().toLowerCase();
    const available = this.getAvailable(context);
    if (!q) return available;

    return available.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.shortcut?.toLowerCase().includes(q)
    );
  }

  public static async execute(commandId: string, context: CommandContext): Promise<boolean> {
    const cmd = this.get(commandId);
    if (!cmd) return false;
    if (cmd.isAvailable && !cmd.isAvailable(context)) return false;

    await cmd.execute(context);
    return true;
  }
}
