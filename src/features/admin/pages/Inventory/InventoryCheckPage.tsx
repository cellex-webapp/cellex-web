import React, { useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Input, InputNumber, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useInventory from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';

const { Text } = Typography;

type CheckLine = IInventorySkuSearchItem & {
  actualStock: number;
  reason?: string;
};

const InventoryCheckPageContent: React.FC = () => {
  const { message } = App.useApp();
  const { userRole, currentShop } = useAuth();
  const canManage = userRole === 'VENDOR';
  const { searchSkus, balanceInventory, fetchCheckHistory, isLoading } = useInventory();

  const [skuKeyword, setSkuKeyword] = useState('');
  const [skuOptions, setSkuOptions] = useState<IInventorySkuSearchItem[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState<string>();
  const [lines, setLines] = useState<CheckLine[]>([]);
  const [checkHistory, setCheckHistory] = useState<IInventoryCheckHistoryItem[]>([]);

  useEffect(() => {
    if (skuKeyword.trim().length < 2) {
      setSkuOptions([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchSkus(skuKeyword.trim(), { limit: 20, shopId: canManage ? currentShop?.id : undefined })
        .then((result) => setSkuOptions(result))
        .catch(() => setSkuOptions([]));
    }, 250);

    return () => clearTimeout(timeout);
  }, [skuKeyword, searchSkus, canManage, currentShop?.id]);

  useEffect(() => {
    fetchCheckHistory({ shopId: canManage ? currentShop?.id : undefined, limit: 10 })
      .then((result) => setCheckHistory(result))
      .catch(() => setCheckHistory([]));
  }, [fetchCheckHistory, canManage, currentShop?.id]);

  const skuSelectOptions = useMemo(
    () => skuOptions.map((sku) => ({
      value: sku.skuId,
      label: `${sku.skuCode} - ${sku.productName}`,
    })),
    [skuOptions]
  );

  const addLineBySku = (skuId: string) => {
    const sku = skuOptions.find((item) => item.skuId === skuId);
    if (!sku) return;

    if (lines.some((item) => item.skuId === skuId)) {
      message.warning('SKU đã tồn tại trong phiếu kiểm kê');
      setSelectedSkuId(undefined);
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        ...sku,
        actualStock: sku.onHandStock,
        reason: '',
      },
    ]);
    setSelectedSkuId(undefined);
  };

  const updateLine = (skuId: string, patch: Partial<CheckLine>) => {
    setLines((prev) => prev.map((line) => (
      line.skuId === skuId
        ? { ...line, ...patch }
        : line
    )));
  };

  const removeLine = (skuId: string) => {
    setLines((prev) => prev.filter((line) => line.skuId !== skuId));
  };

  const handleSubmitCheck = async () => {
    if (!canManage) return;
    if (lines.length === 0) {
      message.warning('Vui lòng thêm ít nhất 1 SKU để kiểm kê');
      return;
    }

    const invalidLine = lines.find((line) => line.actualStock < 0);
    if (invalidLine) {
      message.warning('Số lượng thực tế không được âm');
      return;
    }

    try {
      const result = await balanceInventory({
        shopId: currentShop?.id,
        items: lines.map((line) => ({
          skuId: line.skuId,
          actualStock: line.actualStock,
          reason: line.reason?.trim() || undefined,
        })),
      });

      message.success(`Cân bằng kho thành công. Mã phiếu: ${result.checkId}`);
      setLines([]);
      const history = await fetchCheckHistory({ shopId: canManage ? currentShop?.id : undefined, limit: 10 });
      setCheckHistory(history);
    } catch (err: any) {
      message.error(err?.message || 'Không thể cân bằng kho');
    }
  };

  const monitorColumns: ColumnsType<IInventorySkuSearchItem> = [
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 160,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Tồn hệ thống',
      dataIndex: 'onHandStock',
      key: 'onHandStock',
      width: 130,
      align: 'right',
    },
    {
      title: 'Tồn giữ',
      dataIndex: 'reservedStock',
      key: 'reservedStock',
      width: 110,
      align: 'right',
    },
    {
      title: 'Tồn khả dụng',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 130,
      align: 'right',
    },
    {
      title: 'Tồn an toàn',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 120,
      align: 'right',
    },
    {
      title: 'Biến thể',
      key: 'variationData',
      render: (_, record) => record.variationData
        ? Object.entries(record.variationData).map(([key, value]) => `${key}: ${value}`).join(' | ')
        : <Text type="secondary">—</Text>,
    },
  ];

  const columns: ColumnsType<CheckLine> = [
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 160,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Tồn hệ thống',
      dataIndex: 'onHandStock',
      key: 'onHandStock',
      width: 130,
      align: 'right',
    },
    {
      title: 'Tồn thực tế',
      key: 'actualStock',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.actualStock}
          onChange={(value) => updateLine(record.skuId, { actualStock: Number(value || 0) })}
        />
      ),
    },
    {
      title: 'Lệch',
      key: 'difference',
      width: 110,
      align: 'right',
      render: (_, record) => {
        const diff = record.actualStock - record.onHandStock;
        return <Tag color={diff === 0 ? 'default' : diff > 0 ? 'green' : 'red'}>{diff > 0 ? `+${diff}` : diff}</Tag>;
      },
    },
    {
      title: 'Lý do',
      key: 'reason',
      width: 260,
      render: (_, record) => (
        <Input
          value={record.reason}
          onChange={(e) => updateLine(record.skuId, { reason: e.target.value })}
          placeholder="VD: Kiểm kê cuối tháng"
        />
      ),
    },
    {
      title: '',
      key: 'remove',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => removeLine(record.skuId)} />
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <Card title={canManage ? 'Kiểm kê và cân bằng kho' : 'Theo dõi tồn kho và sai lệch'} className="shadow-sm">
        <Space direction="vertical" className="w-full" size="middle">
          {!canManage && (
            <Alert
              type="info"
              showIcon
              message="Chế độ theo dõi"
              description="Admin chỉ xem tồn kho và sai lệch. Chức năng cân bằng kho chỉ dành cho vendor."
            />
          )}

          <Space wrap>
            <Select
              showSearch
              filterOption={false}
              placeholder="Tìm SKU theo mã hoặc tên sản phẩm"
              style={{ width: canManage ? 420 : 520 }}
              value={selectedSkuId}
              onSearch={setSkuKeyword}
              onChange={setSelectedSkuId}
              onSelect={addLineBySku}
              options={skuSelectOptions}
              notFoundContent={skuKeyword.trim().length < 2 ? 'Nhập ít nhất 2 ký tự' : 'Không tìm thấy SKU'}
            />
            {canManage && (
              <Button icon={<PlusOutlined />} onClick={() => selectedSkuId && addLineBySku(selectedSkuId)}>
                Thêm dòng
              </Button>
            )}
          </Space>

          {canManage ? (
            <>
              <Table
                rowKey="skuId"
                columns={columns}
                dataSource={lines}
                pagination={false}
                locale={{ emptyText: 'Chưa có SKU nào trong phiếu kiểm kê' }}
              />

              <div className="flex items-center justify-between">
                <Text type="secondary">Tổng dòng: {lines.length}</Text>
                <Button type="primary" className="!bg-indigo-600" onClick={handleSubmitCheck} loading={isLoading}>
                  Cân bằng kho
                </Button>
              </div>
            </>
          ) : (
            <Table
              rowKey="skuId"
              columns={monitorColumns}
              dataSource={skuOptions}
              pagination={false}
              locale={{ emptyText: skuKeyword.trim().length < 2 ? 'Nhập từ khóa để xem tồn kho' : 'Không tìm thấy SKU' }}
            />
          )}
        </Space>
      </Card>

      <Card title="Danh sách cân bằng kho đã tạo" className="shadow-sm">
        <Table<IInventoryCheckHistoryItem>
          rowKey="checkCode"
          dataSource={checkHistory}
          loading={isLoading && checkHistory.length === 0}
          pagination={false}
          locale={{ emptyText: 'Chưa có phiếu cân bằng kho nào' }}
          columns={[
            {
              title: 'Mã phiếu',
              dataIndex: 'checkCode',
              key: 'checkCode',
              render: (value: string) => <Tag color="geekblue">{value}</Tag>,
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              width: 120,
              render: (value: string) => <Tag color={value === 'BALANCED' ? 'green' : 'default'}>{value}</Tag>,
            },
            {
              title: 'Tổng chênh lệch',
              dataIndex: 'totalAdjustedQuantity',
              key: 'totalAdjustedQuantity',
              width: 130,
              align: 'right',
            },
            {
              title: 'Lý do',
              dataIndex: 'reason',
              key: 'reason',
              render: (value?: string) => value || <Text type="secondary">—</Text>,
            },
            {
              title: 'Thời gian',
              dataIndex: 'createdAt',
              key: 'createdAt',
              width: 180,
              render: (value: string) => new Date(value).toLocaleString('vi-VN'),
            },
          ]}
        />
      </Card>
    </div>
  );
};

const InventoryCheckPage: React.FC = () => (
  <App>
    <InventoryCheckPageContent />
  </App>
);

export default InventoryCheckPage;
