import { describe, it, expect } from 'vitest';
import { HistoryStack, HistoryCommand } from '../history';

interface TestDoc {
  text: string;
}

describe('HistoryStack', () => {
  it('should execute, undo, and redo state changes accurately', () => {
    const history = new HistoryStack<TestDoc>();
    let state: TestDoc = { text: 'Hello' };

    const cmd1: HistoryCommand<TestDoc> = {
      id: 'cmd-1',
      name: 'append world',
      execute: (s) => ({ text: s.text + ' World' }),
      undo: (s) => ({ text: s.text.replace(' World', '') }),
      timestamp: Date.now(),
    };

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);

    state = history.execute(state, cmd1);
    expect(state.text).toBe('Hello World');
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);

    const undoResult = history.undo(state);
    state = undoResult.state;
    expect(state.text).toBe('Hello');
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);

    const redoResult = history.redo(state);
    state = redoResult.state;
    expect(state.text).toBe('Hello World');
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });
});
