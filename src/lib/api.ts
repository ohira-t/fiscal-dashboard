/**
 * 財務ダッシュボード API クライアント
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Term {
  id: number;
  term_number: number;
  period_start: string | null;
  period_end: string | null;
}

export interface Account {
  code: number;
  name: string;
  category: '資産' | '負債' | '純資産' | '収益' | '費用';
  subcategory: string;
}

export interface TrialBalance {
  id: number;
  term_id: number;
  account_code: number;
  opening_balance: number;
  debit_amount: number;
  credit_amount: number;
  closing_balance: number;
  ratio: number;
  term_number?: number;
  account_name?: string;
  category?: string;
  subcategory?: string;
}

export interface TermComparison {
  code: number;
  name: string;
  category: string;
  subcategory: string;
  term_15: number | null;
  term_16: number | null;
  term_17: number | null;
  change_15_16: number | null;
  change_16_17: number | null;
}

export interface CategorySummary {
  [term: number]: {
    [category: string]: {
      total: number;
      count: number;
    };
  };
}

export interface KpiData {
  [term: number]: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    total_revenue: number;
    total_expenses: number;
    profit: number;
    equity_ratio: number;
    profit_margin: number;
    total_assets_change?: number | null;
    total_revenue_change?: number | null;
    profit_change?: number | null;
  };
}

export interface BsData {
  [term: number]: {
    資産: Array<{ subcategory: string; total: number }>;
    負債: Array<{ subcategory: string; total: number }>;
    純資産: Array<{ subcategory: string; total: number }>;
  };
}

export interface PlData {
  [term: number]: {
    収益: Array<{ subcategory: string; total: number }>;
    費用: Array<{ subcategory: string; total: number }>;
  };
}

export interface JournalEntry {
  id: number;
  term_id: number;
  term_number: number;
  entry_date: string;
  account_code: number;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
  dept_code: string | null;
  partner: string | null;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

export async function getTerms(): Promise<Term[]> {
  const data = await fetchApi<{ terms: Term[] }>('/terms');
  return data.terms;
}

export async function getAccounts(category?: string): Promise<Account[]> {
  const endpoint = category ? `/accounts?category=${encodeURIComponent(category)}` : '/accounts';
  const data = await fetchApi<{ accounts: Account[] }>(endpoint);
  return data.accounts;
}

export async function getTrialBalance(term?: number): Promise<TrialBalance[]> {
  const endpoint = term ? `/trial-balance/${term}` : '/trial-balance';
  const data = await fetchApi<{ trial_balance?: TrialBalance[]; trial_balances?: TrialBalance[] }>(endpoint);
  return data.trial_balance || data.trial_balances || [];
}

export async function getCategorySummary(): Promise<CategorySummary> {
  const data = await fetchApi<{ category_summary: CategorySummary }>('/category-summary');
  return data.category_summary;
}

export async function getTermComparison(): Promise<TermComparison[]> {
  const data = await fetchApi<{ comparison: TermComparison[] }>('/term-comparison');
  return data.comparison;
}

export async function getKpi(): Promise<KpiData> {
  const data = await fetchApi<{ kpi: KpiData }>('/kpi');
  return data.kpi;
}

export async function getBsData(): Promise<BsData> {
  const data = await fetchApi<{ bs_data: BsData }>('/bs-data');
  return data.bs_data;
}

export async function getPlData(): Promise<PlData> {
  const data = await fetchApi<{ pl_data: PlData }>('/pl-data');
  return data.pl_data;
}

export async function getJournalEntries(
  code: number,
  options?: { term?: number; limit?: number; offset?: number }
): Promise<{ entries: JournalEntry[]; total: number }> {
  let endpoint = `/journal/${code}`;
  const params = new URLSearchParams();
  if (options?.term) params.append('term', options.term.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  
  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }
  
  const data = await fetchApi<{ journal_entries: JournalEntry[]; total: number }>(endpoint);
  return { entries: data.journal_entries, total: data.total };
}

// フォーマッタ
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// カテゴリカラー
export const categoryColors: Record<string, string> = {
  '資産': '#3b82f6',      // blue
  '負債': '#ef4444',      // red
  '純資産': '#22c55e',    // green
  '収益': '#8b5cf6',      // violet
  '費用': '#f97316'       // orange
};
