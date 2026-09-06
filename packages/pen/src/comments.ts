import { CommentThread, CommentEntry, PenDocumentModel } from './types';

export class CommentManager {
  /**
   * Adds a new comment thread on a specific block or inline element.
   */
  public static addThread(
    doc: PenDocumentModel,
    targetBlockId: string,
    author: string,
    initialContent: string,
    targetInlineId?: string
  ): CommentThread {
    if (!doc.comments) {
      doc.comments = [];
    }

    const threadId = `cmt_th_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newEntry: CommentEntry = {
      id: commentId,
      author,
      content: initialContent,
      createdAt: Date.now(),
    };

    const newThread: CommentThread = {
      id: threadId,
      targetBlockId,
      targetInlineId,
      author,
      createdAt: Date.now(),
      resolved: false,
      comments: [newEntry],
    };

    doc.comments.push(newThread);
    return newThread;
  }

  /**
   * Adds a reply to an existing comment thread.
   */
  public static addReply(
    doc: PenDocumentModel,
    threadId: string,
    author: string,
    content: string
  ): CommentEntry {
    const thread = doc.comments?.find((t) => t.id === threadId);
    if (!thread) {
      throw new Error(`Comment thread "${threadId}" not found`);
    }

    const reply: CommentEntry = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author,
      content,
      createdAt: Date.now(),
    };

    thread.comments.push(reply);
    return reply;
  }

  /**
   * Resolves or unresolves a comment thread.
   */
  public static setResolved(doc: PenDocumentModel, threadId: string, resolved: boolean): void {
    const thread = doc.comments?.find((t) => t.id === threadId);
    if (thread) {
      thread.resolved = resolved;
    }
  }

  /**
   * Deletes a comment thread.
   */
  public static deleteThread(doc: PenDocumentModel, threadId: string): boolean {
    if (!doc.comments) return false;
    const initialLen = doc.comments.length;
    doc.comments = doc.comments.filter((t) => t.id !== threadId);
    return doc.comments.length < initialLen;
  }

  /**
   * Returns all comment threads for a given block.
   */
  public static getThreadsForBlock(doc: PenDocumentModel, blockId: string): CommentThread[] {
    return (doc.comments || []).filter((t) => t.targetBlockId === blockId);
  }
}
