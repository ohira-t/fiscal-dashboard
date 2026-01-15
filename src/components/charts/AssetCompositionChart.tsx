'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency, categoryColors } from '@/lib/api';

interface AssetCompositionChartProps {
  data: Record<number, {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
  }>;
  selectedTerm: number;
}

export function AssetCompositionChart({ data, selectedTerm }: AssetCompositionChartProps) {
  const termData = data[selectedTerm];
  
  if (!termData) return null;

  const chartData = [
    { name: '資産', value: termData.total_assets, color: categoryColors['資産'] },
    { name: '負債', value: termData.total_liabilities, color: categoryColors['負債'] },
    { name: '純資産', value: termData.total_equity, color: categoryColors['純資産'] }
  ].filter(item => item.value !== 0);

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.payload.color }}
            />
            <span className="font-medium">{entry.name}</span>
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(entry.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card className="animate-fade-in opacity-0 stagger-3">
      <CardHeader>
        <CardTitle className="text-lg">財政状態構成</CardTitle>
        <CardDescription>{selectedTerm}期の資産・負債・純資産比率</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
