export interface CellComment {
  id: string;
  sheetId: string;
  cellKey: string; // e.g. "A1"
  author: string;
  text: string;
  createdAt: number;
  resolved?: boolean;
}

export class CellCommentManager {
  private comments: Map<string, CellComment[]> = new Map(); // sheetId -> comments

  public addComment(sheetId: string, cellKey: string, author: string, text: string): CellComment {
    const sheetComments = this.comments.get(sheetId) || [];
    const comment: CellComment = {
      id: `cell_cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sheetId,
      cellKey: cellKey.toUpperCase(),
      author,
      text,
      createdAt: Date.now(),
      resolved: false,
    };
    sheetComments.push(comment);
    this.comments.set(sheetId, sheetComments);
    return comment;
  }

  public getComments(sheetId: string, cellKey?: string): CellComment[] {
    const list = this.comments.get(sheetId) || [];
    if (cellKey) {
      const upper = cellKey.toUpperCase();
      return list.filter((c) => c.cellKey === upper);
    }
    return [...list];
  }

  public deleteComment(sheetId: string, commentId: string): boolean {
    const list = this.comments.get(sheetId);
    if (!list) return false;
    const initialLen = list.length;
    const filtered = list.filter((c) => c.id !== commentId);
    this.comments.set(sheetId, filtered);
    return filtered.length < initialLen;
  }

  public setResolved(sheetId: string, commentId: string, resolved: boolean): void {
    const list = this.comments.get(sheetId);
    const comment = list?.find((c) => c.id === commentId);
    if (comment) {
      comment.resolved = resolved;
    }
  }
}
