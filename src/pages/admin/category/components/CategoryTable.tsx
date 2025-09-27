import React from "react";
import { Button, Popconfirm, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Props {
  data: ICategory[];
  loading?: boolean;
  parentNameById: (id?: string) => string | undefined;
  onEdit: (record: ICategory) => void;
  onDelete: (record: ICategory) => void;
  onToggleActive: (record: ICategory, checked: boolean) => void;
}

const CategoryTable: React.FC<Props> = ({
  data,
  loading,
  parentNameById,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const columns: ColumnsType<ICategory> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          {record.imageUrl ? (
            <a
              href={record.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500"
            >
              Xem hình ảnh
            </a>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Danh mục cha",
      key: "parent",
      render: (_, r) => parentNameById(r.parentId) || <Tag>Root</Tag>,
      responsive: ["md"],
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean, record) => (
        <Switch
          checked={val}
          onChange={(checked) => onToggleActive(record, checked)}
          size="small"
        />
      ),
      width: 120,
    },
    {
      title: "Thứ tự",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 100,
      align: "right",
      responsive: ["lg"],
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val: string) => new Date(val).toLocaleString(),
      responsive: ["lg"],
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description={`Bạn chắc chắn xóa "${record.name}"?`}
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <Table<ICategory>
      rowKey={(r) => r.categoryId}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
};

export default CategoryTable;
