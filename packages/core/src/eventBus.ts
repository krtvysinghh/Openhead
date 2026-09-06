export type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  public on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off<T = any>(event: string, handler: EventHandler<T>): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  public emit<T = any>(event: string, payload: T): void {
    const set = this.handlers.get(event);
    if (set) {
      for (const handler of set) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error handling event '${event}':`, err);
        }
      }
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}
