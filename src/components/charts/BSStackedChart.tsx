'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, BsData } from '@/lib/api';

interface BSStackedChartProps {
  data: BsData;
}

const ASSET_COLORS = [
  'hsl(220, 90%, 55%)',
  'hsl(220, 80%, 65%)',
  'hsl(220, 70%, 75%)',
  'hsl(220, 60%, 80%)'
];

export function BSStackedChart({ data }: BSStackedChartProps) {
  // Transform data for stacked bar chart
  const chartData = Object.entries(data).map(([term, categories]) => {
    const result: Record<string, number | string> = { term: `${term}期` };
    
    // Assets
    categories.資産?.forEach((item) => {
      result[`資産_${item.subcategory}`] = item.total;
    });
    
    // Liabilities
    categories.負債?.forEach((item) => {
      result[`負債_${item.subcategory}`] = item.total;
    });
    
    // Equity
    categories.純資産?.forEach((item) => {
      result[`純資産_${item.subcategory}`] = item.total;
    });
    
    return result;
  });

  // Get unique subcategories
  const assetSubs = new Set<string>();
  const liabilitySubs = new Set<string>();
  const equitySubs = new Set<string>();

  Object.values(data).forEach(categories => {
    categories.資産?.forEach(item => assetSubs.add(item.subcategory));
    categories.負債?.forEach(item => liabilitySubs.add(item.subcategory));
    categories.純資産?.forEach(item => equitySubs.add(item.subcategory));
  });

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 max-h-[300px] overflow-auto">
          <p className="font-semibold text-popover-foreground mb-2">{label}</p>
          {payload.filter(p => p.value !== 0).map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {entry.name.split('_')[1]}
                </span>
              </div>
              <span className="text-xs font-medium tabular-nums">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in opacity-0 stagger-4">
      <CardHeader>
        <CardTitle className="text-lg">貸借対照表推移</CardTitle>
        <CardDescription>資産・負債・純資産のサブカテゴリ別推移</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis 
                type="number"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                dataKey="term" 
                type="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-xs">{value.split('_')[1]}</span>
                )}
              />
              
              {/* Asset bars */}
              {Array.from(assetSubs).map((sub, idx) => (
                <Bar 
                  key={`資産_${sub}`}
                  dataKey={`資産_${sub}`}
                  stackId="assets"
                  fill={ASSET_COLORS[idx % ASSET_COLORS.length]}
                  name={`資産_${sub}`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
