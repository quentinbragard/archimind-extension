import React from 'react';
import {  
  BarChart,
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartData } from '@/services/analytics/StatsService';
import { getMessage } from '@/core/utils/i18n';
import { BarChart2 } from 'lucide-react';

interface StatsChartProps {
  data: ChartData;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  color?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
}

/**
 * Reusable chart component for stats visualization
 */
const StatsChart: React.FC<StatsChartProps> = ({ 
  data, 
  type = 'bar',
  color = "#3b82f6",
  showLegend = false,
  showGrid = true
}) => {
  // Format data for recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index] || 0
  }));
  
  // Default colors if not provided
  const colors = data.colors || [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#6366f1', // Indigo
    '#ef4444'  // Red
  ];
  
  // Render appropriate chart based on type
  const renderChart = () => {
    // Check if there's any data to display
    const hasData = data.values.some(value => value > 0) || data.values.length === 0;
    
    // If no data, show an empty state
    if (!hasData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <BarChart2 className="h-10 w-10 text-muted-foreground mb-2 opacity-30" />
          <p className="text-xs text-muted-foreground">No data available</p>
        </div>
      );
    }
    
    switch (type) {
      case 'bar':
        console.log("chartData", chartData);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false}
                width={25}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#ccc', marginBottom: '4px' }}
              />
              {showLegend && <Legend />}
              <Bar 
                dataKey="value" 
                fill={color} 
                radius={[2, 2, 0, 0]} 
                barSize={data.labels.length > 5 ? 12 : 20}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                innerRadius={type === 'doughnut' ? 40 : 0}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string; percent: number }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  padding: '8px'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#ccc', marginBottom: '4px' }}
              />
              {showLegend && (
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '10px' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>{getMessage('unsupportedChartType', undefined, 'Unsupported chart type')}</div>;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {renderChart()}
    </div>
  );
};

export default StatsChart;