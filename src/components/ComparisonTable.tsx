'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TermComparison, formatCurrency, formatPercent, categoryColors } from '@/lib/api';
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ComparisonTableProps {
  data: TermComparison[];
  onAccountClick?: (code: number) => void;
}

export function ComparisonTable({ data, onAccountClick }: ComparisonTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [significantOnly, setSignificantOnly] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(data.map(d => d.category));
    return Array.from(cats);
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data;

    // カテゴリフィルタ
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    // 検索フィルタ
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.code.toString().includes(search)
      );
    }

    // 重要変動のみ（±20%以上の変動）
    if (significantOnly) {
      filtered = filtered.filter(d =>
        (d.change_15_16 !== null && Math.abs(d.change_15_16) >= 20) ||
        (d.change_16_17 !== null && Math.abs(d.change_16_17) >= 20)
      );
    }

    return filtered;
  }, [data, categoryFilter, search, significantOnly]);

  const renderChange = (change: number | null) => {
    if (change === null) return <span className="text-muted-foreground">-</span>;
    
    const isSignificant = Math.abs(change) >= 20;
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
      <div className={`flex items-center gap-1 ${
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 
        isNegative ? 'text-red-600 dark:text-red-400' : 
        'text-muted-foreground'
      }`}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        <span className={`tabular-nums ${isSignificant ? 'font-semibold' : ''}`}>
          {formatPercent(change)}
        </span>
        {isSignificant && (
          <AlertCircle className="h-3 w-3 text-amber-500" />
        )}
      </div>
    );
  };

  return (
    <Card className="animate-fade-in opacity-0 stagger-5">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">期比較テーブル</CardTitle>
            <CardDescription>15期・16期・17期の勘定科目比較</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredData.length}件
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* フィルターコントロール */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="科目名またはコードで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: categoryColors[cat] }}
                    />
                    {cat}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={significantOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSignificantOnly(!significantOnly)}
            className="whitespace-nowrap"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            重要変動
          </Button>
        </div>

        {/* テーブル */}
        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">コード</TableHead>
                <TableHead>科目名</TableHead>
                <TableHead className="w-[80px]">カテゴリ</TableHead>
                <TableHead className="text-right w-[120px]">15期</TableHead>
                <TableHead className="text-right w-[120px]">16期</TableHead>
                <TableHead className="text-center w-[90px]">増減率</TableHead>
                <TableHead className="text-right w-[120px]">17期</TableHead>
                <TableHead className="text-center w-[90px]">増減率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow 
                  key={row.code}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onAccountClick?.(row.code)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.name}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${categoryColors[row.category]}20`,
                        color: categoryColors[row.category]
                      }}
                    >
                      {row.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.term_15 !== null ? formatCurrency(row.term_15) : '-'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.term_16 !== null ? formatCurrency(row.term_16) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderChange(row.change_15_16)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.term_17 !== null ? formatCurrency(row.term_17) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderChange(row.change_16_17)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
