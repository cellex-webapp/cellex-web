import React, { useEffect, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Input, InputNumber, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useInventory from '@/hooks/useInventory';
import useSupplier from '@/hooks/useSupplier';
import { useAuth } from '@/hooks/useAuth';

const { Text } = Typography;

type ImportLine = IInventorySkuSearchItem & {
  quantity: number;
  importPrice: number;
};

const InventoryImportPageContent: React.FC = () => {
  const { message } = App.useApp();
  const { userRole, currentShop } = useAuth();
  const canManage = userRole === 'VENDOR';
  const { suppliers, fetchSuppliers } = useSupplier();
  const { searchSkus, importInventory, fetchImportHistory, isLoading } = useInventory();

  const [supplierId, setSupplierId] = useState<string>();
  const [note, setNote] = useState('');
  const [skuKeyword, setSkuKeyword] = useState('');
  const [skuOptions, setSkuOptions] = useState<IInventorySkuSearchItem[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState<string>();
  const [lines, setLines] = useState<ImportLine[]>([]);
  const [importHistory, setImportHistory] = useState<IInventoryImportHistoryItem[]>([]);

  useEffect(() => {
    if (!canManage) return;
    fetchSuppliers({ page: 1, limit: 100, sortBy: 'createdAt', sortType: 'desc', shopId: currentShop?.id }).catch(() => undefined);
  }, [fetchSuppliers, canManage, currentShop?.id]);

  useEffect(() => {
    fetchImportHistory({ shopId: canManage ? currentShop?.id : undefined, limit: 10 })
      .then((result) => setImportHistory(result))
      .catch(() => setImportHistory([]));
  }, [fetchImportHistory, canManage, currentShop?.id]);

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

  const supplierOptions = useMemo(
    () => suppliers.map((supplier) => ({
      value: supplier.id,
      label: `${supplier.supplierName} - ${supplier.phoneNumber}`,
    })),
    [suppliers]
  );

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
      message.warning('SKU đã tồn tại trong danh sách');
      setSelectedSkuId(undefined);
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        ...sku,
        quantity: 1,
        importPrice: Number(sku.price || 0),
      },
    ]);
    setSelectedSkuId(undefined);
  };

  const updateLine = (skuId: string, field: 'quantity' | 'importPrice', value: number) => {
    setLines((prev) => prev.map((line) => (
      line.skuId === skuId
        ? { ...line, [field]: value }
        : line
    )));
  };

  const removeLine = (skuId: string) => {
    setLines((prev) => prev.filter((line) => line.skuId !== skuId));
  };

  const handleSubmitImport = async () => {
    if (!canManage) return;
    if (!supplierId) {
      message.warning('Vui lòng chọn nhà cung cấp');
      return;
    }

    if (lines.length === 0) {
      message.warning('Vui lòng thêm ít nhất 1 SKU');
      return;
    }

    const invalidLine = lines.find((line) => line.quantity <= 0 || line.importPrice <= 0);
    if (invalidLine) {
      message.warning('Số lượng và giá nhập phải lớn hơn 0');
      return;
    }

    try {
      const result = await importInventory({
        shopId: currentShop?.id,
        supplierId,
        note: note.trim() || undefined,
        items: lines.map((line) => ({
          skuId: line.skuId,
          quantity: line.quantity,
          importPrice: line.importPrice,
        })),
      });

      message.success(`Nhập kho thành công. Mã phiếu: ${result.referenceId}`);
      setLines([]);
      setNote('');
      setSupplierId(undefined);
      const history = await fetchImportHistory({ shopId: canManage ? currentShop?.id : undefined, limit: 10 });
      setImportHistory(history);
    } catch (err: any) {
      message.error(err?.message || 'Không thể nhập kho');
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
      title: 'Tồn hiện tại',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 120,
      align: 'right',
    },
    {
      title: 'Tồn hệ thống',
      dataIndex: 'onHandStock',
      key: 'onHandStock',
      width: 120,
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

  const columns: ColumnsType<ImportLine> = [
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
      title: 'Tồn hiện tại',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 120,
      align: 'right',
    },
    {
      title: 'Số lượng nhập',
      key: 'quantity',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateLine(record.skuId, 'quantity', Number(value || 0))}
        />
      ),
    },
    {
      title: 'Giá nhập',
      key: 'importPrice',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          value={record.importPrice}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number((value || '').replace(/,/g, ''))}
          onChange={(value) => updateLine(record.skuId, 'importPrice', Number(value || 0))}
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
      <Card title={canManage ? 'Nhập kho theo SKU' : 'Theo dõi tồn kho theo SKU'} className="shadow-sm">
        <Space direction="vertical" className="w-full" size="middle">
          {!canManage && (
            <Alert
              type="info"
              showIcon
              message="Chế độ theo dõi"
              description="Admin chỉ xem dữ liệu tồn kho. Chức năng nhập kho chỉ dành cho vendor."
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
              <>
                <Select
                  placeholder="Chọn nhà cung cấp"
                  style={{ width: 380 }}
                  value={supplierId}
                  onChange={setSupplierId}
                  options={supplierOptions}
                  showSearch
                  optionFilterProp="label"
                />
                <Button icon={<PlusOutlined />} onClick={() => selectedSkuId && addLineBySku(selectedSkuId)}>
                  Thêm dòng
                </Button>
              </>
            )}
          </Space>

          {canManage ? (
            <>
              <Input.TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú phiếu nhập (tùy chọn)"
              />

              <Table
                rowKey="skuId"
                columns={columns}
                dataSource={lines}
                pagination={false}
                locale={{ emptyText: 'Chưa có SKU nào trong phiếu nhập' }}
              />

              <div className="flex items-center justify-between">
                <Text type="secondary">Tổng dòng: {lines.length}</Text>
                <Button type="primary" className="!bg-indigo-600" onClick={handleSubmitImport} loading={isLoading}>
                  Tạo phiếu nhập
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

      <Card title="Danh sách nhập kho đã tạo" className="shadow-sm">
        <Table<IInventoryImportHistoryItem>
          rowKey="referenceId"
          dataSource={importHistory}
          loading={isLoading && importHistory.length === 0}
          pagination={false}
          locale={{ emptyText: 'Chưa có phiếu nhập kho nào' }}
          columns={[
            {
              title: 'Mã phiếu',
              dataIndex: 'referenceId',
              key: 'referenceId',
              render: (value: string) => <Tag color="geekblue">{value}</Tag>,
            },
            {
              title: 'Nhà cung cấp',
              dataIndex: 'supplierName',
              key: 'supplierName',
              render: (value?: string) => value || <Text type="secondary">—</Text>,
            },
            {
              title: 'Tổng số lượng',
              dataIndex: 'totalQuantity',
              key: 'totalQuantity',
              width: 120,
              align: 'right',
            },
            {
              title: 'Tổng tiền nhập',
              dataIndex: 'totalImportAmount',
              key: 'totalImportAmount',
              width: 160,
              align: 'right',
              render: (value: number) => Number(value || 0).toLocaleString('vi-VN') + ' đ',
            },
            {
              title: 'Thời gian',
              dataIndex: 'importedAt',
              key: 'importedAt',
              width: 180,
              render: (value: string) => new Date(value).toLocaleString('vi-VN'),
            },
          ]}
        />
      </Card>
    </div>
  );
};

const InventoryImportPage: React.FC = () => (
  <App>
    <InventoryImportPageContent />
  </App>
);

export default InventoryImportPage;
