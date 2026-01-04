import React from 'react';
import { Card } from 'antd';
import {
  LineChart,
  Line,
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
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '@/services/ai.service';

interface AIChartRendererProps {
  chartData: ChartData;
}

// Default color palette
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#0ea5e9', // Cyan
  '#f97316', // Orange
];

const AIChartRenderer: React.FC<AIChartRendererProps> = ({ chartData }) => {
  const { chartType, title, labels, datasets } = chartData;

  // Transform data for recharts format
  const transformedData = labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };
    datasets.forEach((ds) => {
      dataPoint[ds.label] = ds.data[index];
    });
    return dataPoint;
  });

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    if (value >= 1000000) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Custom Y-axis tick formatter
  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={transformedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tickFormatter={formatYAxisTick}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          formatter={(value: number) => [formatTooltipValue(value), '']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '11px' }}
          iconSize={12}
        />
        {datasets.map((ds, idx) => (
          <Line
            key={ds.label}
            type="monotone"
            dataKey={ds.label}
            stroke={ds.borderColor || COLORS[idx % COLORS.length]}
            strokeWidth={2}
            dot={{ fill: ds.borderColor || COLORS[idx % COLORS.length], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={transformedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tickFormatter={formatYAxisTick}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip 
          formatter={(value: number) => [formatTooltipValue(value), '']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '11px' }}
          iconSize={12}
        />
        {datasets.map((ds, idx) => (
          <Bar
            key={ds.label}
            dataKey={ds.label}
            fill={ds.backgroundColor || COLORS[idx % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    // For pie chart, use the first dataset
    const pieData = labels.map((label, index) => ({
      name: label,
      value: datasets[0]?.data[index] || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), '']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px' }}
            iconSize={12}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'LINE':
        return renderLineChart();
      case 'BAR':
        return renderBarChart();
      case 'PIE':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <Card 
      size="small" 
      className="bg-white shadow-sm"
      styles={{ body: { padding: '12px' } }}
    >
      {title && (
        <div className="text-center font-semibold text-sm mb-2 text-gray-700">
          {title}
        </div>
      )}
      {renderChart()}
    </Card>
  );
};

export default AIChartRenderer;
