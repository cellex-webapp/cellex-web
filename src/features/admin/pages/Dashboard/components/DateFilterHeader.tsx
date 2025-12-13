import React, { useState } from 'react';
import { Button, DatePicker, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Props {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onFilterChange: (startDate: string, endDate: string) => void;
}

const DateFilterHeader: React.FC<Props> = ({ 
  title, 
  subtitle, 
  isLoading, 
  onRefresh, 
  onFilterChange 
}) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'), 
    dayjs()
  ]);

  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);
      const start = dates[0].format('YYYY-MM-DD');
      const end = dates[1].format('YYYY-MM-DD');
      onFilterChange(start, end);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        onFilterChange(start, end);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <Title level={2} className="!mb-0">{title}</Title>
        {subtitle && (
          <Text type="secondary">
            {subtitle} ({dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')})
          </Text>
        )}
      </div>
      <Space>
        <RangePicker 
          value={dateRange} 
          onChange={handleDateChange} 
          format="DD/MM/YYYY" 
          allowClear={false}
        />
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          loading={isLoading} 
          onClick={handleRefresh}
          className="!bg-indigo-600"
        >
          Làm mới
        </Button>
      </Space>
    </div>
  );
};

export default DateFilterHeader;