import { TrackedChange, PenDocumentModel, InlineStyle } from './types';

export class TrackChangesManager {
  /**
   * Records a text insertion change.
   */
  public static trackInsertion(
    doc: PenDocumentModel,
    blockId: string,
    author: string,
    insertedText: string,
    inlineId?: string
  ): TrackedChange {
    if (!doc.trackedChanges) doc.trackedChanges = [];

    const change: TrackedChange = {
      id: `tc_ins_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'insert',
      blockId,
      inlineId,
      author,
      timestamp: Date.now(),
      newValue: insertedText,
      status: 'pending',
    };

    doc.trackedChanges.push(change);
    return change;
  }

  /**
   * Records a text deletion change.
   */
  public static trackDeletion(
    doc: PenDocumentModel,
    blockId: string,
    author: string,
    deletedText: string,
    inlineId?: string
  ): TrackedChange {
    if (!doc.trackedChanges) doc.trackedChanges = [];

    const change: TrackedChange = {
      id: `tc_del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'delete',
      blockId,
      inlineId,
      author,
      timestamp: Date.now(),
      originalValue: deletedText,
      status: 'pending',
    };

    doc.trackedChanges.push(change);
    return change;
  }

  /**
   * Records a formatting modification.
   */
  public static trackFormat(
    doc: PenDocumentModel,
    blockId: string,
    author: string,
    originalStyle: InlineStyle,
    newStyle: InlineStyle,
    inlineId?: string
  ): TrackedChange {
    if (!doc.trackedChanges) doc.trackedChanges = [];

    const change: TrackedChange = {
      id: `tc_fmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'format',
      blockId,
      inlineId,
      author,
      timestamp: Date.now(),
      originalStyle,
      newStyle,
      status: 'pending',
    };

    doc.trackedChanges.push(change);
    return change;
  }

  /**
   * Accepts a specific tracked change.
   */
  public static acceptChange(doc: PenDocumentModel, changeId: string): boolean {
    const change = doc.trackedChanges?.find((c) => c.id === changeId);
    if (!change || change.status !== 'pending') return false;

    change.status = 'accepted';
    return true;
  }

  /**
   * Rejects a specific tracked change.
   */
  public static rejectChange(doc: PenDocumentModel, changeId: string): boolean {
    const change = doc.trackedChanges?.find((c) => c.id === changeId);
    if (!change || change.status !== 'pending') return false;

    change.status = 'rejected';
    return true;
  }

  /**
   * Accepts all pending tracked changes.
   */
  public static acceptAll(doc: PenDocumentModel): number {
    if (!doc.trackedChanges) return 0;
    let count = 0;
    for (const change of doc.trackedChanges) {
      if (change.status === 'pending') {
        change.status = 'accepted';
        count++;
      }
    }
    return count;
  }

  /**
   * Rejects all pending tracked changes.
   */
  public static rejectAll(doc: PenDocumentModel): number {
    if (!doc.trackedChanges) return 0;
    let count = 0;
    for (const change of doc.trackedChanges) {
      if (change.status === 'pending') {
        change.status = 'rejected';
        count++;
      }
    }
    return count;
  }
}
