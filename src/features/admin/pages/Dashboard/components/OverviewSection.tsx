import React from 'react';
import { Card, Col, Row, Statistic, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { getIcon, TrendIcon } from './DashboardHelpers';

interface Props {
  data?: ISummaryCard[];
}

const OverviewSection: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const colSpan = 24 / Math.min(data.length, 4);

  return (
    <Row gutter={[16, 16]}>
      {data.map((card, index) => (
        <Col key={index} xs={24} sm={12} lg={colSpan}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                {card.title}
                {card.description && (
                  <Tooltip title={card.description}>
                    <InfoCircleOutlined className="text-gray-300 text-xs" />
                  </Tooltip>
                )}
              </span>
              <div className={`p-2 rounded-lg bg-opacity-10 ${
                index === 0 ? 'bg-green-100 text-green-600' : 
                index === 1 ? 'bg-blue-100 text-blue-600' : 
                'bg-purple-100 text-purple-600'
              }`}>
                {getIcon(card.icon, "text-xl")}
              </div>
            </div>
            
            <Statistic 
              value={card.value} // API trả về string đã format hoặc số
              valueStyle={{ fontWeight: 'bold', fontSize: '1.5rem' }}
            />

            <div className="flex items-center mt-2 text-sm">
              <span className={`flex items-center gap-1 font-medium ${
                card.trend === 'UP' ? 'text-green-500' : 
                card.trend === 'DOWN' ? 'text-red-500' : 'text-gray-400'
              }`}>
                <TrendIcon trend={card.trend} />
                {Math.abs(card.changePercent || 0)}%
              </span>
              <span className="text-gray-400 ml-2">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default OverviewSection;