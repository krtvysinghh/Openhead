export type PluginPermission =
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:outbound'
  | 'document:read'
  | 'document:write'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'commands:register'
  | 'formulas:register';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
  entryPoint?: string;
  enabled?: boolean;
}

export interface PluginContext {
  manifest: PluginManifest;
  hasPermission: (perm: PluginPermission) => boolean;
  registerCommand: (name: string, executeFn: () => void) => void;
  registerFormula?: (name: string, fn: (...args: any[]) => any) => void;
  log: (msg: string) => void;
}

export type PluginInitializer = (ctx: PluginContext) => void | Promise<void>;

export interface OfficePlugin {
  manifest: PluginManifest;
  initFn?: PluginInitializer;
}

export class PluginManager {
  private plugins: Map<string, { manifest: PluginManifest; initFn?: PluginInitializer }> = new Map();
  private commands: Map<string, () => any> = new Map();
  private formulas: Map<string, { name: string; description: string; minArgs: number; maxArgs: number; compute: (args: any[]) => any }> = new Map();

  constructor() {}

  /**
   * Registers a plugin instance.
   */
  public registerPlugin(pluginOrManifest: OfficePlugin | PluginManifest, initFn?: PluginInitializer): void {
    const manifest: PluginManifest = 'manifest' in pluginOrManifest ? pluginOrManifest.manifest : pluginOrManifest;
    const fn = 'initFn' in pluginOrManifest ? pluginOrManifest.initFn : initFn;

    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin "${manifest.id}" is already registered.`);
    }

    const fullManifest: PluginManifest = {
      ...manifest,
      enabled: manifest.enabled ?? true,
      permissions: manifest.permissions || [],
      description: manifest.description || '',
      author: manifest.author || 'Anonymous',
    };

    this.plugins.set(manifest.id, { manifest: fullManifest, initFn: fn });

    if (fullManifest.enabled && fn) {
      const granted = new Set(fullManifest.permissions);
      const ctx: PluginContext = {
        manifest: fullManifest,
        hasPermission: (perm: PluginPermission) => granted.has(perm),
        registerCommand: (name: string, executeFn: () => void) => {
          if (!granted.has('commands:register')) {
            throw new Error(`Plugin "${manifest.id}" attempted to register command "${name}" without "commands:register" permission.`);
          }
          this.commands.set(`${manifest.id}:${name}`, executeFn);
        },
        registerFormula: (name: string, compFn: (...args: any[]) => any) => {
          if (!granted.has('formulas:register')) {
            throw new Error(`Plugin "${manifest.id}" attempted to register formula "${name}" without "formulas:register" permission.`);
          }
          this.formulas.set(name.toUpperCase(), {
            name: name.toUpperCase(),
            description: `Plugin formula from ${manifest.id}`,
            minArgs: 0,
            maxArgs: 99,
            compute: (args) => compFn(...args),
          });
        },
        log: (msg: string) => {
          console.log(`[Plugin:${manifest.id}] ${msg}`);
        },
      };

      try {
        fn(ctx);
      } catch (err: any) {
        console.error(`Failed to initialize plugin ${manifest.id}:`, err);
      }
    }
  }

  public hasPermission(pluginId: string, permission: PluginPermission): boolean {
    const p = this.plugins.get(pluginId);
    if (!p) return false;
    return (p.manifest.permissions || []).includes(permission);
  }

  public registerPluginCommand(pluginId: string, cmd: { id: string; title: string; category: string; action: () => any }): void {
    if (!this.hasPermission(pluginId, 'commands:register')) {
      throw new Error(`Permission denied: Plugin "${pluginId}" requires "commands:register" permission.`);
    }
    this.commands.set(cmd.id, cmd.action);
  }

  public registerPluginFormula(pluginId: string, formula: { name: string; description: string; minArgs: number; maxArgs: number; compute: (args: any[]) => any }): void {
    if (!this.hasPermission(pluginId, 'formulas:register')) {
      throw new Error(`Permission denied: Plugin "${pluginId}" requires "formulas:register" permission.`);
    }
    this.formulas.set(formula.name.toUpperCase(), formula);
  }

  public getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  public getRegisteredCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  public getRegisteredFormulas(): string[] {
    return Array.from(this.formulas.keys());
  }

  public executeCommand(commandId: string): any {
    const fn = this.commands.get(commandId);
    if (!fn) throw new Error(`Command "${commandId}" not found.`);
    return fn();
  }

  public evaluateFormula(formulaName: string, args: any[]): any {
    const formula = this.formulas.get(formulaName.toUpperCase());
    if (!formula) throw new Error(`Formula "${formulaName}" not found.`);
    return formula.compute(args);
  }

  // Static backward compatibility helpers
  public static registerPlugin(manifest: PluginManifest, initFn?: PluginInitializer): void {
    const mgr = new PluginManager();
    mgr.registerPlugin(manifest, initFn);
  }
}
