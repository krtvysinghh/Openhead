import { PenDocumentModel } from '../../pen/src/types';
import { WorkbookModel } from '../../sum/src/types';
import { GlimpseDeckModel } from '../../glimpse/src/types';
import { generateId } from './types';

export interface OfficeTemplateItem<T = any> {
  id: string;
  product: 'pen' | 'sum' | 'glimpse';
  title: string;
  name?: string;
  description: string;
  category: string;
  tags: string[];
  createModel: () => T;
  generator?: () => T;
}

export type OfficeTemplate<T = any> = OfficeTemplateItem<T>;

export class OfficeTemplateLibrary {
  public static getTemplates(product: 'pen' | 'sum' | 'glimpse'): OfficeTemplateItem[] {
    if (product === 'pen') return this.getPenTemplates();
    if (product === 'sum') return this.getSumTemplates();
    if (product === 'glimpse') return this.getGlimpseTemplates();
    return this.getAllTemplates();
  }
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
        description: 'Professional correspondence with sender, date, recipient, and signature block.',
        category: 'Business',
        tags: ['letter', 'formal', 'communication'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Business Letter', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'OPENHEAD ENTERPRISE CORP.' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '100 Innovation Parkway, Suite 400\nSan Francisco, CA 94105\n\nSeptember 6, 2026' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'To: Enterprise Client Procurement Team\nSubject: Formal Enterprise Partnership Agreement' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Dear Executive Leadership,\n\nWe are pleased to submit our formal proposal for deploying the Openhead sovereign office suite across your worldwide distributed workforce. Openhead eliminates background cloud telemetry while delivering seamless Microsoft Office OpenXML compatibility...' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Sincerely,\n\nExecutive Director of Client Solutions\nOpenhead Core Team' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_executive_report',
        product: 'pen',
        title: 'Executive Strategic Report',
        description: 'Multi-section strategic review with executive summary callouts, data tables, and roadmap.',
        category: 'Business',
        tags: ['report', 'strategy', 'executive'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Q3 Strategic Performance Report', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Q3 Strategic Performance & Governance Report' }] },
              { id: generateId('blk'), type: 'callout', variant: 'info', inlines: [{ id: generateId('inl'), text: 'Executive Summary: Overall annual software productivity metrics exceeded baseline forecasts by 22.4% with zero reported security incidents.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '1. Financial & Operational Highlights' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Operating expenses were reduced significantly following the migration to self-hosted, local-first office infrastructure.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '2. Risk Mitigation & Compliance' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'All internal documents remained strictly governed by zero-telemetry boundary policies and local encryption standards.' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_meeting_notes',
        product: 'pen',
        title: 'Meeting Notes & Action Items',
        description: 'Structured sync template with attendees list, discussion topics, and checklist of action items.',
        category: 'Productivity',
        tags: ['notes', 'minutes', 'actions'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Executive Sync Meeting Notes', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Weekly Leadership Sync' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Meeting Details' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Date: September 6, 2026\nChair: Principal Architect\nAttendees: Engineering, Security, Design, Product Teams' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Key Discussion Topics' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '1. Production v1.0.0 release verification across Windows, macOS, Linux, Android, and iOS.\n2. Deep template library expansion and image insertion across Pen, Sum, and Glimpse.\n3. Continuous offline AI capabilities and permission boundary audits.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Action Items' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: '[X] Ship production release artifacts to GitHub Releases\n[X] Verify zero-telemetry network invariants\n[ ] Publish user quickstart documentation' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_business_proposal',
        product: 'pen',
        title: 'Business Proposal',
        description: 'Detailed proposal with problem statement, methodology, timeline, and commercial terms.',
        category: 'Business',
        tags: ['proposal', 'sales', 'commercial'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Enterprise Solutions Proposal', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Project Proposal: Next-Generation Sovereign Workspace' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '1. Executive Summary & Objective' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'This proposal outlines the strategy for implementing high-performance, privacy-first office software across enterprise divisions.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '2. Technical Architecture & Security' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'All operations execute client-side with native OpenXML fidelity for DOCX, XLSX, and PPTX files.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '3. Implementation Schedule & Deliverables' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Phase 1: Pilot rollout (Weeks 1–2)\nPhase 2: Full enterprise deployment (Weeks 3–4)\nPhase 3: Ongoing support & offline AI fine-tuning' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_nda_contract',
        product: 'pen',
        title: 'Non-Disclosure Agreement (NDA)',
        description: 'Standard mutual confidentiality agreement with legal clauses and signature lines.',
        category: 'Legal',
        tags: ['legal', 'nda', 'agreement'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Mutual Non-Disclosure Agreement', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'MUTUAL NON-DISCLOSURE AGREEMENT' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of September 6, 2026, by and between Company A and Company B.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '1. Confidential Information' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Confidential Information includes all non-public technical, business, software, and proprietary information disclosed by either party.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '2. Obligations of Receiving Party' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'The Receiving Party agrees to protect the Confidential Information using the same degree of care as it uses for its own confidential assets, but not less than reasonable care.' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_academic_paper',
        product: 'pen',
        title: 'Academic Research Paper (APA)',
        description: 'Structured scientific research format with abstract, literature review, and methodology.',
        category: 'Academic',
        tags: ['academic', 'research', 'paper', 'thesis'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Academic Research Paper', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'Topological Calculation in High-Density Spreadsheets' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Author: Department of Computer Science & Systems Engineering\nUniversity Research Group' }] },
              { id: generateId('blk'), type: 'callout', variant: 'note', inlines: [{ id: generateId('inl'), text: 'Abstract: This paper presents an empirical analysis of directed acyclic graph (DAG) topological sorting algorithms applied to large-scale dynamic array recalculation engines.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: '1. Introduction & Background' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Spreadsheet formula evaluation requires deterministic cycle detection and optimal topological ordering to prevent memory overhead.' }] },
            ],
          }],
        }),
      },
      {
        id: 'pen_resume_cv',
        product: 'pen',
        title: 'Executive Resume / CV',
        description: 'Clean typographic layout showcasing career summary, technical skills, and experience.',
        category: 'Personal',
        tags: ['resume', 'cv', 'career'],
        createModel: () => ({
          metadata: { id: generateId('doc'), title: 'Executive Resume', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
          sections: [{
            id: generateId('sec'),
            pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 }, columns: 1 },
            blocks: [
              { id: generateId('blk'), type: 'heading', level: 1, inlines: [{ id: generateId('inl'), text: 'ALEXANDER MORGAN' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Senior Principal Software Engineer | Distributed Systems & Compilers\nSan Francisco, CA • alexander@example.com • github.com/alexandermorgan' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Professional Experience' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'Lead Architect — Sovereign Office Systems (2022–Present)\n• Architected Pratt formula parser and multi-sheet dependency DAG handling 100k+ cells in <50ms.\n• Led cross-platform desktop release engineering across macOS, Windows, and Linux.' }] },
              { id: generateId('blk'), type: 'heading', level: 2, inlines: [{ id: generateId('inl'), text: 'Core Technical Proficiencies' }] },
              { id: generateId('blk'), type: 'paragraph', inlines: [{ id: generateId('inl'), text: 'TypeScript, Rust, React, Office OpenXML (DOCX/XLSX/PPTX), Compilers, WebAssembly, Security Sandboxing.' }] },
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
        description: 'Task assignments, completion percentages, status flags, and delivery dates.',
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
            A6: { raw: 'Release Packaging', value: 'Release Packaging', formula: null },
            B6: { raw: 'Charlie', value: 'Charlie', formula: null },
            C6: { raw: 'Done', value: 'Done', formula: null },
            D6: { raw: 1.0, value: 1.0, formula: null },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'Project Tracker', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Milestones', cells, rowCount: 50, colCount: 10 }],
            activeSheetId: sheetId,
          };
        },
      },
      {
        id: 'sum_financial_dcf',
        product: 'sum',
        title: 'DCF Valuation & Cash Flow Model',
        description: 'Discounted Cash Flow model with WACC discounting, terminal value, and enterprise valuation.',
        category: 'Finance',
        tags: ['dcf', 'valuation', 'finance', 'model'],
        createModel: () => {
          const cells: Record<string, any> = {
            A1: { raw: 'DCF Corporate Valuation Model', value: 'DCF Corporate Valuation Model', formula: null },
            A3: { raw: 'Year', value: 'Year', formula: null },
            B3: { raw: '2026', value: 2026, formula: null },
            C3: { raw: '2027', value: 2027, formula: null },
            D3: { raw: '2028', value: 2028, formula: null },
            E3: { raw: '2029', value: 2029, formula: null },
            A4: { raw: 'Free Cash Flow ($k)', value: 'Free Cash Flow ($k)', formula: null },
            B4: { raw: 12000, value: 12000, formula: null },
            C4: { raw: 15500, value: 15500, formula: null },
            D4: { raw: 19800, value: 19800, formula: null },
            E4: { raw: 24500, value: 24500, formula: null },
            A5: { raw: 'Discount Factor (10%)', value: 'Discount Factor (10%)', formula: null },
            B5: { raw: 0.909, value: 0.909, formula: null },
            C5: { raw: 0.826, value: 0.826, formula: null },
            D5: { raw: 0.751, value: 0.751, formula: null },
            E5: { raw: 0.683, value: 0.683, formula: null },
            A6: { raw: 'Present Value ($k)', value: 'Present Value ($k)', formula: null },
            B6: { raw: '=B4*B5', value: 10908, formula: '=B4*B5' },
            C6: { raw: '=C4*C5', value: 12803, formula: '=C4*C5' },
            D6: { raw: '=D4*D5', value: 14869, formula: '=D4*D5' },
            E6: { raw: '=E4*E5', value: 16733, formula: '=E4*E5' },
            A7: { raw: 'Total Enterprise Value', value: 'Total Enterprise Value', formula: null },
            B7: { raw: '=SUM(B6:E6)', value: 55313, formula: '=SUM(B6:E6)' },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'DCF Model', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Valuation', cells, rowCount: 50, colCount: 10 }],
            activeSheetId: sheetId,
          };
        },
      },
      {
        id: 'sum_payroll_calculator',
        product: 'sum',
        title: 'Payroll & Tax Deductions Calculator',
        description: 'Employee compensation, tax withholding, healthcare deductions, and net pay computation.',
        category: 'HR & Operations',
        tags: ['payroll', 'taxes', 'compensation'],
        createModel: () => {
          const cells: Record<string, any> = {
            A1: { raw: 'Employee Monthly Payroll Calculator', value: 'Employee Monthly Payroll Calculator', formula: null },
            A3: { raw: 'Employee Name', value: 'Employee Name', formula: null },
            B3: { raw: 'Gross Pay', value: 'Gross Pay', formula: null },
            C3: { raw: 'Tax (20%)', value: 'Tax (20%)', formula: null },
            D3: { raw: 'Benefits', value: 'Benefits', formula: null },
            E3: { raw: 'Net Pay', value: 'Net Pay', formula: null },
            A4: { raw: 'Sarah Jenkins', value: 'Sarah Jenkins', formula: null },
            B4: { raw: 8500, value: 8500, formula: null },
            C4: { raw: '=B4*0.20', value: 1700, formula: '=B4*0.20' },
            D4: { raw: 350, value: 350, formula: null },
            E4: { raw: '=B4-C4-D4', value: 6450, formula: '=B4-C4-D4' },
            A5: { raw: 'David Kumar', value: 'David Kumar', formula: null },
            B5: { raw: 9200, value: 9200, formula: null },
            C5: { raw: '=B5*0.20', value: 1840, formula: '=B5*0.20' },
            D5: { raw: 350, value: 350, formula: null },
            E5: { raw: '=B5-C5-D5', value: 7010, formula: '=B5-C5-D5' },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'Payroll Calculator', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Payroll', cells, rowCount: 50, colCount: 10 }],
            activeSheetId: sheetId,
          };
        },
      },
      {
        id: 'sum_sales_crm_pipeline',
        product: 'sum',
        title: 'Sales CRM Pipeline & Forecast',
        description: 'Opportunity stages, win probabilities, weighted revenue forecasts, and account owner metrics.',
        category: 'Sales',
        tags: ['sales', 'pipeline', 'crm', 'forecast'],
        createModel: () => {
          const cells: Record<string, any> = {
            A1: { raw: 'Enterprise Sales CRM Pipeline', value: 'Enterprise Sales CRM Pipeline', formula: null },
            A3: { raw: 'Deal / Account', value: 'Deal / Account', formula: null },
            B3: { raw: 'Stage', value: 'Stage', formula: null },
            C3: { raw: 'Deal Value', value: 'Deal Value', formula: null },
            D3: { raw: 'Probability', value: 'Probability', formula: null },
            E3: { raw: 'Weighted Forecast', value: 'Weighted Forecast', formula: null },
            A4: { raw: 'Acme Global Cloud Migration', value: 'Acme Global Cloud Migration', formula: null },
            B4: { raw: 'Proposal Sent', value: 'Proposal Sent', formula: null },
            C4: { raw: 150000, value: 150000, formula: null },
            D4: { raw: 0.60, value: 0.60, formula: null },
            E4: { raw: '=C4*D4', value: 90000, formula: '=C4*D4' },
            A5: { raw: 'FinTech Core Modernization', value: 'FinTech Core Modernization', formula: null },
            B5: { raw: 'Negotiation', value: 'Negotiation', formula: null },
            C5: { raw: 300000, value: 300000, formula: null },
            D5: { raw: 0.85, value: 0.85, formula: null },
            E5: { raw: '=C5*D5', value: 255000, formula: '=C5*D5' },
          };
          const sheetId = generateId('sheet');
          return {
            metadata: { id: generateId('wb'), title: 'Sales CRM Pipeline', type: 'sum', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            sheets: [{ id: sheetId, name: 'Pipeline', cells, rowCount: 50, colCount: 10 }],
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
        description: 'High-impact investor deck structure with problem, solution, market size, and traction slides.',
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
                title: 'The Problem: Cloud Tracking & Bloat',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'The Problem', fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '• Mandatory cloud tracking and telemetry compromises enterprise confidentiality\n\n• Bloated desktop clients consume gigabytes of RAM\n\n• Strict vendor lock-in restricts file format ownership', fontSize: 24, color: '#CBD5E1', align: 'left', zIndex: 2 },
                ],
              },
              {
                id: s3,
                title: 'The Solution: Sovereign Client-Side Runtime',
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
      {
        id: 'glimpse_qbr_review',
        product: 'glimpse',
        title: 'Quarterly Business Review (QBR)',
        description: 'Structured corporate review covering financial KPIs, OKR attainment, and next-quarter priorities.',
        category: 'Business',
        tags: ['qbr', 'quarterly', 'business', 'okr'],
        createModel: () => {
          const s1 = generateId('slide');
          const s2 = generateId('slide');
          return {
            metadata: { id: generateId('deck'), title: 'Q3 Business Review', type: 'glimpse', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
            slides: [
              {
                id: s1,
                title: 'Q3 Executive Business Review',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 160, y: 360, width: 1600, height: 140, text: 'Q3 Executive Business Review', fontSize: 52, fontWeight: 'bold', color: '#FFFFFF', align: 'center', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 160, y: 520, width: 1600, height: 80, text: 'Strategic Performance & Q4 OKRs', fontSize: 26, color: '#94A3B8', align: 'center', zIndex: 2 },
                ],
              },
              {
                id: s2,
                title: 'Key Accomplishments & Metrics',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'Q3 Key Accomplishments', fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '• Shipped major office suite expansion across Pen, Sum, and Glimpse\n\n• Achieved 100% test pass rate with automated compatibility verification\n\n• Reduced customer onboarding friction to under 30 seconds', fontSize: 24, color: '#CBD5E1', align: 'left', zIndex: 2 },
                ],
              },
            ],
            activeSlideId: s1,
          };
        },
      },
      {
        id: 'glimpse_product_launch',
        product: 'glimpse',
        title: 'Keynote Product Launch',
        description: 'Apple-style keynote deck with bold hero typography, visual feature showcases, and pricing.',
        category: 'Marketing',
        tags: ['keynote', 'product', 'launch', 'marketing'],
        createModel: () => {
          const s1 = generateId('slide');
          const s2 = generateId('slide');
          return {
            metadata: { id: generateId('deck'), title: 'Product Launch Keynote', type: 'glimpse', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
            slides: [
              {
                id: s1,
                title: 'Introducing Openhead 1.0',
                background: '#0B0F19',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 160, y: 340, width: 1600, height: 160, text: 'Say hello to true privacy.', fontSize: 64, fontWeight: 'bold', color: '#FFFFFF', align: 'center', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 160, y: 520, width: 1600, height: 80, text: 'Openhead 1.0 — Available Today', fontSize: 28, color: '#6366F1', align: 'center', zIndex: 2 },
                ],
              },
              {
                id: s2,
                title: 'Three Powerful Apps. One Sovereign Suite.',
                background: '#0B0F19',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'Built For Deep Productivity', fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '• Pen: Documents without distractions\n\n• Sum: Spreadsheets with 90+ formulas and dynamic array spills\n\n• Glimpse: Presentations with instant DrawingML export', fontSize: 24, color: '#94A3B8', align: 'left', zIndex: 2 },
                ],
              },
            ],
            activeSlideId: s1,
          };
        },
      },
      {
        id: 'glimpse_tech_architecture',
        product: 'glimpse',
        title: 'System Architecture & RFC Deck',
        description: 'Technical presentation for engineering reviews, API specs, and cloud architecture deep dives.',
        category: 'Engineering',
        tags: ['architecture', 'engineering', 'rfc', 'tech'],
        createModel: () => {
          const s1 = generateId('slide');
          const s2 = generateId('slide');
          return {
            metadata: { id: generateId('deck'), title: 'Technical Architecture Review', type: 'glimpse', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
            dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
            slides: [
              {
                id: s1,
                title: 'Technical Architecture Deep Dive',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 160, y: 360, width: 1600, height: 140, text: 'Client-Side Compiler Architecture', fontSize: 50, fontWeight: 'bold', color: '#FFFFFF', align: 'center', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 160, y: 520, width: 1600, height: 80, text: 'Pratt Parser, DAG Recalculation & Memory Safety', fontSize: 26, color: '#38BDF8', align: 'center', zIndex: 2 },
                ],
              },
              {
                id: s2,
                title: 'System Design Principles',
                background: '#0F172A',
                nodes: [
                  { id: generateId('node'), type: 'text', x: 100, y: 80, width: 1720, height: 100, text: 'Core Architecture Pillars', fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'left', zIndex: 1 },
                  { id: generateId('node'), type: 'text', x: 100, y: 220, width: 1720, height: 700, text: '1. Zero Outbound Telemetry Invariant\n2. AST-Driven Document & DrawingML Serialization\n3. Sandboxed Extensibility with Explicit Permission Grants\n4. Atomic Storage Persistence with Journaling Checksums', fontSize: 24, color: '#CBD5E1', align: 'left', zIndex: 2 },
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
