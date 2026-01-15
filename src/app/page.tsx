'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiGrid } from '@/components/KpiCard';
import { RevenueExpenseChart } from '@/components/charts/RevenueExpenseChart';
import { AssetCompositionChart } from '@/components/charts/AssetCompositionChart';
import { ComparisonTable } from '@/components/ComparisonTable';
import { JournalDialog } from '@/components/JournalDialog';
import {
  getKpi,
  getTermComparison,
  KpiData,
  TermComparison
} from '@/lib/api';
import { LayoutDashboard, Table, BarChart3, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [comparisonData, setComparisonData] = useState<TermComparison[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number>(17);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Journal dialog state
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [selectedAccountCode, setSelectedAccountCode] = useState<number | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [kpi, comparison] = await Promise.all([
        getKpi(),
        getTermComparison()
      ]);
      
      setKpiData(kpi);
      setComparisonData(comparison);
      
      // 最新の期を選択
      const terms = Object.keys(kpi).map(Number);
      if (terms.length > 0) {
        setSelectedTerm(Math.max(...terms));
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('データの取得に失敗しました。APIサーバーが起動していることを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (code: number) => {
    const account = comparisonData.find(d => d.code === code);
    setSelectedAccountCode(code);
    setSelectedAccountName(account?.name || '');
    setJournalDialogOpen(true);
  };

  const terms = kpiData ? Object.keys(kpiData).map(Number).sort() : [];

  if (error) {
    return (
      <div className="min-h-screen bg-background gradient-mesh">
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">接続エラー</h2>
            <p className="text-muted-foreground max-w-md mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">財務ダッシュボード</h1>
                <p className="text-sm text-muted-foreground">Fiscal Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 期選択 */}
              {!loading && terms.length > 0 && (
                <Select 
                  value={selectedTerm.toString()} 
                  onValueChange={(v) => setSelectedTerm(parseInt(v))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map(term => (
                      <SelectItem key={term} value={term.toString()}>
                        {term}期
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Badge variant="outline" className="hidden sm:flex">
                {new Date().toLocaleDateString('ja-JP')}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">概要</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">チャート</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">詳細</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : kpiData ? (
              <KpiGrid kpiData={kpiData} selectedTerm={selectedTerm} />
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              {loading ? (
                <>
                  <Skeleton className="h-[400px]" />
                  <Skeleton className="h-[400px]" />
                </>
              ) : kpiData ? (
                <>
                  <RevenueExpenseChart data={kpiData} />
                  <AssetCompositionChart data={kpiData} selectedTerm={selectedTerm} />
                </>
              ) : null}
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-8">
            {loading ? (
              <div className="grid gap-6">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : kpiData ? (
              <>
                <RevenueExpenseChart data={kpiData} />
                <AssetCompositionChart data={kpiData} selectedTerm={selectedTerm} />
              </>
            ) : null}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-8">
            {loading ? (
              <Skeleton className="h-[600px]" />
            ) : (
              <ComparisonTable 
                data={comparisonData} 
                onAccountClick={handleAccountClick}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-sm text-muted-foreground">
            財務ダッシュボード v1.0 • SQLite + Next.js
          </p>
        </div>
      </footer>

      {/* Journal Dialog */}
      <JournalDialog
        open={journalDialogOpen}
        onOpenChange={setJournalDialogOpen}
        accountCode={selectedAccountCode}
        accountName={selectedAccountName}
      />
    </div>
  );
}
