'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent } from '@/lib/api';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  change?: number | null;
  isCurrency?: boolean;
  isPercentage?: boolean;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function KpiCard({
  title,
  value,
  change,
  isCurrency = true,
  isPercentage = false,
  icon,
  className = '',
  delay = 0
}: KpiCardProps) {
  const formattedValue = isPercentage
    ? `${value.toFixed(1)}%`
    : isCurrency
    ? formatCurrency(value)
    : value.toLocaleString('ja-JP');

  const getTrendIcon = () => {
    if (change === null || change === undefined) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === null || change === undefined) return 'bg-muted text-muted-foreground';
    if (change > 0) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (change < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card 
      className={`overflow-hidden animate-fade-in opacity-0 ${className}`}
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-bold tracking-tight tabular-nums">
            {formattedValue}
          </div>
          {change !== undefined && (
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-1 font-medium ${getTrendColor()}`}
            >
              {getTrendIcon()}
              {formatPercent(change)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface KpiGridProps {
  kpiData: Record<number, {
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
  }>;
  selectedTerm: number;
}

export function KpiGrid({ kpiData, selectedTerm }: KpiGridProps) {
  const data = kpiData[selectedTerm];
  
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="総資産"
        value={data.total_assets}
        change={data.total_assets_change}
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        delay={0}
      />
      <KpiCard
        title="売上高"
        value={data.total_revenue}
        change={data.total_revenue_change}
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        delay={1}
      />
      <KpiCard
        title="当期純利益"
        value={data.profit}
        change={data.profit_change}
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        delay={2}
      />
      <KpiCard
        title="自己資本比率"
        value={data.equity_ratio}
        isPercentage
        isCurrency={false}
        icon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        delay={3}
      />
    </div>
  );
}
