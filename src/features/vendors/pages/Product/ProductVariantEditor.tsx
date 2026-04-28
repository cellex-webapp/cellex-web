import React, { useEffect, useState } from 'react';
import { Button, Input, InputNumber, Row, Col, Table, Space, Card, Tag, Typography, message, Upload, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, PictureOutlined, LoadingOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { uploadService } from '@/services/upload.service';

const { Text, Title } = Typography;

interface Props {
  form: FormInstance;
  initialSkus?: IProductSku[];
}

const ProductVariantEditor: React.FC<Props> = ({ form, initialSkus = [] }) => {
  const [variationOptions, setVariationOptions] = useState<IProductVariationOption[]>([]);
  const [skus, setSkus] = useState<IProductSkuPayload[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const formVariationOptions = form.getFieldValue('variationOptions') || [];
    const formSkus = form.getFieldValue('skus') || [];

    setVariationOptions(formVariationOptions);
    if (formSkus.length > 0) {
      setSkus(formSkus);
    } else if (initialSkus.length > 0) {
      setSkus(
        initialSkus.map((s) => ({
          skuCode: s.skuCode,
          variationData: s.variationData,
          price: s.price,
          onHandStock: s.onHandStock,
          imageUrl: s.imageUrl,
          isActive: s.isActive,
        }))
      );
    }
  }, [form, initialSkus]);

  const generateCombinations = (options: IProductVariationOption[]): Record<string, string>[] => {
    if (options.length === 0) return [];
    
    const validOptions = options.filter((opt) => opt.name && opt.values && opt.values.length > 0);
    if (validOptions.length === 0) return [];

    let result: Record<string, string>[] = [{}];

    validOptions.forEach((option) => {
      const temp: Record<string, string>[] = [];
      result.forEach((res) => {
        option.values.forEach((val) => {
          temp.push({ ...res, [option.name]: val });
        });
      });
      result = temp;
    });

    return result;
  };

  const handleGenerateSkus = () => {
    const combinations = generateCombinations(variationOptions);
    
    if (combinations.length === 0) {
      message.warning('Vui lòng thêm ít nhất một nhóm phân loại (vd: Màu sắc) có giá trị.');
      return;
    }

    const newSkus = combinations.map((combo) => {
      const existingSku = skus.find((s) => {
        const existingKeys = Object.keys(s.variationData);
        const comboKeys = Object.keys(combo);
        if (existingKeys.length !== comboKeys.length) return false;
        return existingKeys.every((k) => s.variationData[k] === combo[k]);
      });

      if (existingSku) {
        return existingSku;
      }

      return {
        variationData: combo,
        price: 0,
        onHandStock: 0,
        imageUrl: '',
        isActive: true,
      };
    });

    setSkus(newSkus);
    form.setFieldsValue({ skus: newSkus });
  };

  const addVariationOption = () => {
    if (variationOptions.length >= 2) {
      message.warning('Chỉ hỗ trợ tối đa 2 nhóm phân loại (vd: Màu sắc, Dung lượng).');
      return;
    }
    const newOptions = [...variationOptions, { name: '', values: [] }];
    setVariationOptions(newOptions);
    form.setFieldsValue({ variationOptions: newOptions });
  };

  const removeVariationOption = (index: number) => {
    const newOptions = variationOptions.filter((_, i) => i !== index);
    setVariationOptions(newOptions);
    form.setFieldsValue({ variationOptions: newOptions });
    
    if (newOptions.length === 0) {
      setSkus([]);
      form.setFieldsValue({ skus: [] });
    }
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...variationOptions];
    newOptions[index].name = name;
    setVariationOptions(newOptions);
    form.setFieldsValue({ variationOptions: newOptions });
  };

  const updateOptionValues = (index: number, valuesStr: string) => {
    const newOptions = [...variationOptions];
    newOptions[index].values = valuesStr.split(',').map((v) => v.trim()).filter(Boolean);
    setVariationOptions(newOptions);
    form.setFieldsValue({ variationOptions: newOptions });
  };

  const updateSku = (index: number, field: keyof IProductSkuPayload, value: any) => {
    const newSkus = [...skus];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setSkus(newSkus);
    form.setFieldsValue({ skus: newSkus });
  };

  const handleUploadImage = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      const res = await uploadService.upload(file, 'sku-variants');
      if (res.code === 1000 && res.result) {
        updateSku(index, 'imageUrl', res.result);
        message.success('Tải ảnh biến thể thành công');
      }
    } catch (err) {
      message.error('Không thể tải ảnh lên');
    } finally {
      setUploadingIndex(null);
    }
    return false; // Prevent default upload
  };

  const columns = [
    {
      title: 'Biến thể',
      key: 'variation',
      width: 150,
      render: (_: any, record: IProductSkuPayload) => (
        <Space direction="vertical" size={0}>
          {Object.entries(record.variationData).map(([k, v]) => (
            <div key={k} className="flex gap-1 items-center">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">{k}:</span>
              <Tag color="blue" className="m-0 text-xs px-1 py-0">{v}</Tag>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      align: 'center' as const,
      render: (url: string, _: any, index: number) => (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => handleUploadImage(index, file)}
        >
          <div className="relative group cursor-pointer w-12 h-12 border border-dashed border-gray-300 rounded flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors bg-gray-50">
            {url ? (
              <img src={url} alt="Variant" className="w-full h-full object-cover" />
            ) : (
              uploadingIndex === index ? <LoadingOutlined className="text-indigo-500" /> : <PictureOutlined className="text-gray-400 text-lg" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <PlusOutlined className="text-white text-xs" />
            </div>
          </div>
        </Upload>
      ),
    },
    {
      title: 'Giá bán (VND)',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (text: number, _: any, index: number) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(val) => updateSku(index, 'price', val)}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          className="w-full"
          placeholder="Giá"
        />
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'onHandStock',
      key: 'onHandStock',
      width: 100,
      render: (text: number, _: any, index: number) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(val) => updateSku(index, 'onHandStock', val)}
          className="w-full"
          placeholder="Kho"
        />
      ),
    },
    {
      title: 'Mã SKU (tùy chọn)',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 180,
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          onChange={(e) => updateSku(index, 'skuCode', e.target.value)}
          placeholder="Hệ thống tự tạo"
          className="text-xs"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {variationOptions.map((opt, index) => (
          <Card key={index} size="small" className="bg-gray-50 border-none" bodyStyle={{ padding: '12px' }}>
            <Row gutter={12} align="middle">
              <Col span={8}>
                <div className="text-[11px] font-bold text-gray-500 mb-1 uppercase">Tên nhóm phân loại</div>
                <Input
                  placeholder="Ví dụ: Màu sắc, Dung lượng..."
                  value={opt.name}
                  onChange={(e) => updateOptionName(index, e.target.value)}
                />
              </Col>
              <Col span={14}>
                <div className="text-[11px] font-bold text-gray-500 mb-1 uppercase">Các giá trị (cách nhau bằng dấu phẩy)</div>
                <Input
                  placeholder="Ví dụ: Đỏ, Xanh, Đen..."
                  defaultValue={opt.values.join(', ')}
                  onBlur={(e) => updateOptionValues(index, e.target.value)}
                />
              </Col>
              <Col span={2} className="flex justify-center pt-5">
                <Tooltip title="Xóa nhóm">
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeVariationOption(index)} />
                </Tooltip>
              </Col>
            </Row>
            {opt.values.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {opt.values.map((v, i) => (
                  <Tag key={i} color="default" className="text-[11px] rounded-full px-2">{v}</Tag>
                ))}
              </div>
            )}
          </Card>
        ))}
        
        {variationOptions.length < 2 && (
          <Button 
            type="dashed" 
            onClick={addVariationOption} 
            icon={<PlusOutlined />} 
            className="w-full h-10 border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-400"
          >
            Thêm nhóm phân loại mới
          </Button>
        )}
      </div>

      {variationOptions.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex justify-between items-center">
             <Title level={5} className="!mb-0 !text-sm uppercase tracking-wider text-gray-600">Danh sách các biến thể (SKU)</Title>
             <Button type="primary" size="small" ghost onClick={handleGenerateSkus} className="rounded-md">
                Tạo/Cập nhật danh sách SKU
             </Button>
          </div>

          {skus.length > 0 ? (
            <Table
              dataSource={skus}
              columns={columns}
              rowKey={(record) => Object.values(record.variationData).join('-')}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 600 }}
              className="sku-table overflow-hidden rounded-lg shadow-sm"
            />
          ) : (
            <div className="py-8 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
               <Text className="text-gray-400">Chưa có SKU nào. Nhấn "Tạo danh sách SKU" sau khi nhập phân loại.</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVariantEditor;

