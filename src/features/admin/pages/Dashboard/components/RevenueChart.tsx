import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from './DashboardHelpers';

interface Props {
  data?: IChartData;
}

const RevenueChart: React.FC<Props> = ({ data }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card bordered={false} className="shadow-sm h-full flex items-center justify-center">
        <Empty description="Chưa có dữ liệu biểu đồ" />
      </Card>
    );
  }

  return (
    <Card bordered={false} className="shadow-sm h-full">
      <div className="mb-6">
        <Typography.Title level={5} className="!mb-0">{data.title}</Typography.Title>
        <Typography.Text type="secondary" className="text-xs">
          Tổng: {formatCurrency(data.total || 0)}
        </Typography.Text>
      </div>
      
      <div style={{ height: 320, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#6B7280', fontSize: 11}} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#6B7280', fontSize: 11}} 
              tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`} 
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), data.yaxisLabel || 'Giá trị']}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;