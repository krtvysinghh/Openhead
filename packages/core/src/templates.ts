import { PenDocumentModel } from '../../pen/src/types';
import { WorkbookModel } from '../../sum/src/types';
import { GlimpseDeckModel } from '../../glimpse/src/types';
import { generateId } from './types';

export interface OfficeTemplateItem<T = any> {
  id: string;
  product: 'pen' | 'sum' | 'glimpse';
  title: string;
  description: string;
  category: string;
  tags: string[];
  createModel: () => T;
}

export class OfficeTemplateLibrary {
  public static getPenTemplates(): OfficeTemplateItem<PenDocumentModel>[] {
    return [
      {
        id: 'pen_blank',
        product: 'pen',
        title: 'Blank Document',
        description: 'Clean slate for standard letters, essays, or notes.',
        category: 'General',
        tags: ['blank', 'clean'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Untitled Document', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [{ id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '' }] }],
          }],
        }),
      },
      {
        id: 'pen_business_letter',
        product: 'pen',
        title: 'Business Letter',
        description: 'Professional correspondence with sender and recipient headers.',
        category: 'Business',
        tags: ['letter', 'formal', 'communication'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Business Letter', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'ACME CORPORATION' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '123 Market Street, San Francisco, CA 94105\nSeptember 6, 2026' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Dear Client,\n\nWe are pleased to submit our formal proposal for the upcoming quarterly enterprise engagement...' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_executive_report',
        product: 'pen',
        title: 'Executive Report',
        description: 'Comprehensive multi-section strategic report with callouts and tables.',
        category: 'Business',
        tags: ['report', 'strategy', 'executive'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Q3 Strategic Performance Report', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Q3 Strategic Performance Report' }] },
              { id: generateId('blk'), type: 'callout', variant: 'info', inlines: [{ id: generateId('inl'), text: 'Executive Summary: Overall company performance exceeded annual targets by 14.2%.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '1. Financial Highlights' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Revenue expansion was primarily driven by enterprise software subscriptions.' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_meeting_notes',
        product: 'pen',
        title: 'Meeting Notes',
        description: 'Action items, attendees, and discussion summary.',
        category: 'Productivity',
        tags: ['notes', 'minutes', 'actions'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Team Sync Meeting Notes', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Weekly Engineering Sync' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Attendees & Agenda' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '• Product Architecture Review\n• Release 1.0.0 Verification\n• Local-First AI Integration' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Action Items' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '[ ] Complete regression test pass\n[ ] Finalize documentation' }] },
            ],
          }],
        }),
      },
    ];
  }

  public static getSumTemplates(): OfficeTemplateItem<WorkbookModel>[] {
    return [
      {
        id: 'sum_blank',
        product: 'sum',
        title: 'Blank Workbook',
        description: 'Empty spreadsheet grid with high-performance formula engine.',
        category: 'General',
        tags: ['blank', 'grid'],
        createModel: () => ({
          metadata: { id: generateId('wb'), title: 'Untitled Spreadsheet', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sheets: [{ id: generateId('sheet'), name: 'Sheet1', cells: {}, rowCount: 100, colCount: 26 }],
          activeSheetId: '',
        }),
      },
      {
        id: 'sum_budget',
        product: 'sum',
        title: 'Annual Department Budget',
        description: 'Monthly expense breakdown with automatic SUMIFS and variance analysis.',
        category: 'Finance',
        tags: ['budget', 'expenses', 'finance'],
        createModel: () => {
          const cells: Record<string, any> = {
            A1: { raw: 'Department Annual Budget', value: 'Department Annual Budget', formula: null },
            A3: { raw: 'Category', value: 'Category', formula: null },
            B3: { raw: 'Q1 Budget', value: 'Q1 Budget', formula: null },
            C3: { raw: 'Q1 Actual', value: 'Q1 Actual', formula: null },
            D3: { raw: 'Variance', value: 'Variance', formula: null },
            A4: { raw: 'Engineering', value: 'Engineering', formula: null },
            B4: { raw: 50000, value: 50000, formula: null },
            C4: { raw: 48500, value: 48500, formula: null },
            D4: { raw: '=B4-C4', value: 1500, formula: '=B4-C4' },
            A5: { raw: 'Marketing', value: 'Marketing', formula: null },
            B5: { raw: 30000, value: 30000, formula: null },
            C5: { raw: 32000, value: 32000, formula: null },
            D5: { raw: '=B5-C5', value: -2000, formula: '=B5-C5' },
            A6: { raw: 'Total', value: 'Total', formula: null },
            B6: { raw: '=SUM(B4:B5)', value: 80000, formula: '=SUM(B4:B5)' },
            C6: { raw: '=SUM(C4:C5)', value: 80500, formula: '=SUM(C4:C5)' },
            D6: { raw: '=B6-C6', value: -500, formula: '=B6-C6' },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'Annual Budget', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Budget2026', cells, rowCount: 50, colCount: 10 }],
            activeSheetId: sheetId,
          };
        },
      },
      {
        id: 'sum_project_tracker',
        product: 'sum',
        title: 'Project Milestone Tracker',
        description: 'Task assignments, completion percentages, and delivery dates.',
        category: 'Project Management',
        tags: ['tasks', 'tracker', 'milestones'],
        createModel: () => {
          const cells: Record<string, any> = {
            A1: { raw: 'Project Delivery Tracker', value: 'Project Delivery Tracker', formula: null },
            A3: { raw: 'Task Name', value: 'Task Name', formula: null },
            B3: { raw: 'Owner', value: 'Owner', formula: null },
            C3: { raw: 'Status', value: 'Status', formula: null },
            D3: { raw: 'Progress', value: 'Progress', formula: null },
            A4: { raw: 'Core Engine Polish', value: 'Core Engine Polish', formula: null },
            B4: { raw: 'Alice', value: 'Alice', formula: null },
            C4: { raw: 'Done', value: 'Done', formula: null },
            D4: { raw: 1.0, value: 1.0, formula: null },
            A5: { raw: 'XLSX Interop Lab', value: 'XLSX Interop Lab', formula: null },
            B5: { raw: 'Bob', value: 'Bob', formula: null },
            C5: { raw: 'In Progress', value: 'In Progress', formula: null },
            D5: { raw: 0.85, value: 0.85, formula: null },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'Project Tracker', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Milestones', cells, rowCount: 50, colCount: 10 }],
            activeSheetId: sheetId,
          };
        },
      },
    ];
  }

  public static getGlimpseTemplates(): OfficeTemplateItem<GlimpseDeckModel>[] {
    return [
      {
        id: 'glimpse_blank',
        product: 'glimpse',
        title: 'Blank Presentation',
        description: '16:9 widescreen canvas with master layout controls.',
        category: 'General',
        tags: ['blank', 'canvas'],
        createModel: () => {
          const slideId = generateId('slide');
          return {
            metadata: { id: generateId('deck'), title: 'Untitled Presentation', type: 'glimpse', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
            slides: [
              {
                id: slideId,
                title: 'Title Slide',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 160, y: 380, width: 1600, height: 140, text: 'Click to add title', fontSize: 52, fontWeight: 'bold', color: '#FFFFFF', align: 'center', zIndex: 1 },
                ],
              },
            ],
            activeSlideId: slideId,
          };
        },
      },
      {
        id: 'glimpse_pitch_deck',
        product: 'glimpse',
        title: 'Executive Pitch Deck',
        description: 'High-impact investor deck structure with problem, solution, and metric slides.',
        category: 'Business',
        tags: ['pitch', 'investor', 'startup'],
        createModel: () => {
          const s1 = generateId('slide');
          const s2 = generateId('slide');
          const s3 = generateId('slide');
          return {
            metadata: { id: generateId('deck'), title: 'Series A Pitch Deck', type: 'glimpse', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
            slides: [
              {
                id: s1,
                title: 'Openhead Office',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 160, y: 360, width: 1600, height: 140, text: 'Openhead Office', fontSize: 56, fontWeight: 'bold', color: '#FFFFFF', align: 'center', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 160, y: 520, width: 1600, height: 80, text: 'The Sovereign, Local-First Office Suite', fontSize: 26, color: '#94A3B8', align: 'center', zIndex: 2 },
                ],
              },
              {
                id: s2,
                title: 'The Problem & Market Opportunity',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'The Problem', fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '• Mandatory cloud tracking and telemetry compromises enterprise confidentiality\n\n• Bloated desktop clients consume gigabytes of RAM\n\n• Strict vendor lock-in restricts file format ownership', fontSize: 24, color: '#CBD5E1', align: 'left', zIndex: 2 },
                ],
              },
              {
                id: s3,
                title: 'Our Solution: Total Local Sovereignty',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'The Solution', fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '• 100% Offline-First Architecture\n\n• Native OOXML (DOCX, XLSX, PPTX) High Fidelity\n\n• Integrated Local AI with Permission Scopes & Zero Telemetry', fontSize: 24, color: '#CBD5E1', align: 'left', zIndex: 2 },
                ],
              },
            ],
            activeSlideId: s1,
          };
        },
      },
    ];
  }

  public static getAllTemplates(): OfficeTemplateItem[] {
    return [
      ...this.getPenTemplates(),
      ...this.getSumTemplates(),
      ...this.getGlimpseTemplates(),
    ];
  }
}
