'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getJournalEntries, JournalEntry, formatCurrency } from '@/lib/api';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountCode: number | null;
  accountName?: string;
}

export function JournalDialog({ 
  open, 
  onOpenChange, 
  accountCode,
  accountName 
}: JournalDialogProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termFilter, setTermFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchEntries = useCallback(async () => {
    if (!accountCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getJournalEntries(accountCode, {
        term: termFilter !== 'all' ? parseInt(termFilter) : undefined,
        limit,
        offset: page * limit
      });
      setEntries(result.entries);
      setTotal(result.total);
    } catch (err) {
      setError('明細データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accountCode, termFilter, page, limit]);

  useEffect(() => {
    if (open && accountCode) {
      fetchEntries();
    }
  }, [open, accountCode, fetchEntries]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            勘定科目明細
          </DialogTitle>
          <DialogDescription>
            {accountCode && (
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{accountCode}</Badge>
                {accountName && <span>{accountName}</span>}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* フィルター */}
          <div className="flex items-center justify-between">
            <Select value={termFilter} onValueChange={(v) => { setTermFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="期を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての期</SelectItem>
                <SelectItem value="15">15期</SelectItem>
                <SelectItem value="16">16期</SelectItem>
                <SelectItem value="17">17期</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {total}件
            </Badge>
          </div>

          {/* テーブル */}
          <ScrollArea className="h-[400px] rounded-md border">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>明細データがありません</p>
                <p className="text-sm mt-1">大容量明細データをインポートしてください</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[60px]">期</TableHead>
                    <TableHead className="w-[100px]">日付</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="text-right w-[120px]">借方</TableHead>
                    <TableHead className="text-right w-[120px]">貸方</TableHead>
                    <TableHead className="w-[80px]">部門</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.term_number}期
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.entry_date || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.dept_code || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
