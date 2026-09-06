import { describe, it, expect } from 'vitest';
import { PenDocument } from '../document';
import { CommentManager } from '../comments';
import { TrackChangesManager } from '../trackedChanges';
import { SpellCheckEngine } from '../spellcheck';
import { OutlineGenerator } from '../outline';

describe('Pen Comments, Track Changes, SpellCheck & Outline Architecture', () => {
  it('should create comment threads, reply to comments, resolve and delete threads', () => {
    const doc = new PenDocument();
    doc.addHeading('Executive Report', 1);
    const p = doc.addParagraph('This proposal requires extensive review.');

    const thread = CommentManager.addThread(
      doc.getModel(),
      p.id,
      'Alice Reviewer',
      'Please elaborate on the budget estimates.'
    );

    expect(thread.id).toBeDefined();
    expect(thread.author).toBe('Alice Reviewer');
    expect(thread.resolved).toBe(false);
    expect(thread.comments.length).toBe(1);

    const reply = CommentManager.addReply(
      doc.getModel(),
      thread.id,
      'Bob Author',
      'Added Appendix B with broken down expenditures.'
    );

    expect(reply.author).toBe('Bob Author');
    expect(thread.comments.length).toBe(2);

    CommentManager.setResolved(doc.getModel(), thread.id, true);
    expect(thread.resolved).toBe(true);

    const blockThreads = CommentManager.getThreadsForBlock(doc.getModel(), p.id);
    expect(blockThreads.length).toBe(1);

    const deleted = CommentManager.deleteThread(doc.getModel(), thread.id);
    expect(deleted).toBe(true);
    expect(doc.getModel().comments?.length).toBe(0);
  });

  it('should track text insertions, deletions, formatting changes and accept/reject them', () => {
    const doc = new PenDocument();
    const p = doc.addParagraph('Original sentence text.');

    const ins = TrackChangesManager.trackInsertion(
      doc.getModel(),
      p.id,
      'Editor',
      ' revised'
    );
    expect(ins.status).toBe('pending');
    expect(ins.type).toBe('insert');

    const del = TrackChangesManager.trackDeletion(
      doc.getModel(),
      p.id,
      'Editor',
      'sentence '
    );
    expect(del.status).toBe('pending');

    const fmt = TrackChangesManager.trackFormat(
      doc.getModel(),
      p.id,
      'Editor',
      { bold: false },
      { bold: true }
    );
    expect(fmt.status).toBe('pending');

    // Test individual accept
    TrackChangesManager.acceptChange(doc.getModel(), ins.id);
    expect(ins.status).toBe('accepted');

    // Test accept all remaining
    const acceptedCount = TrackChangesManager.acceptAll(doc.getModel());
    expect(acceptedCount).toBe(2);
    expect(del.status).toBe('accepted');
    expect(fmt.status).toBe('accepted');
  });

  it('should perform fast spell-checking with custom dictionary additions', () => {
    const correctResult = SpellCheckEngine.checkWord('document');
    expect(correctResult.isCorrect).toBe(true);

    const misspelled = SpellCheckEngine.checkWord('paragrah');
    expect(misspelled.isCorrect).toBe(false);
    expect(misspelled.suggestions).toContain('paragraph');

    // Test custom dictionary
    SpellCheckEngine.addToDictionary('OpenheadCustomTerm');
    const customResult = SpellCheckEngine.checkWord('OpenheadCustomTerm');
    expect(customResult.isCorrect).toBe(true);
  });

  it('should generate hierarchical outlines and formatted Table of Contents', () => {
    const doc = new PenDocument();
    doc.getModel().sections[0].blocks = [];
    doc.addHeading('1. Introduction', 1);
    doc.addParagraph('Introductory details...');
    doc.addHeading('1.1 Background Context', 2);
    doc.addParagraph('Background info...');
    doc.addHeading('2. Implementation', 1);

    const outline = OutlineGenerator.generateOutline(doc.getModel());
    expect(outline.length).toBe(3);
    expect(outline[0].title).toBe('1. Introduction');
    expect(outline[0].level).toBe(1);
    expect(outline[1].title).toBe('1.1 Background Context');
    expect(outline[1].level).toBe(2);

    const tocBlocks = OutlineGenerator.generateTableOfContents(doc.getModel());
    expect(tocBlocks.length).toBe(3);
    expect(tocBlocks[0].inlines[0].text).toBe('1. Introduction');
  });
});
