export interface HistoryCommand<TState> {
  id: string;
  name: string;
  execute: (state: TState) => TState;
  undo: (state: TState) => TState;
  timestamp: number;
}

export class HistoryStack<TState> {
  private undoStack: HistoryCommand<TState>[] = [];
  private redoStack: HistoryCommand<TState>[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  public execute(state: TState, command: HistoryCommand<TState>): TState {
    const nextState = command.execute(state);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    return nextState;
  }

  public undo(state: TState): { state: TState; command?: HistoryCommand<TState> } {
    const command = this.undoStack.pop();
    if (!command) {
      return { state };
    }
    const nextState = command.undo(state);
    this.redoStack.push(command);
    return { state: nextState, command };
  }

  public redo(state: TState): { state: TState; command?: HistoryCommand<TState> } {
    const command = this.redoStack.pop();
    if (!command) {
      return { state };
    }
    const nextState = command.execute(state);
    this.undoStack.push(command);
    return { state: nextState, command };
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
