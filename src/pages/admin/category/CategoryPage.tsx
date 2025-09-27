import React, { useState } from "react";
import { Form } from "antd";
import CategoryHeader from "./components/CategoryHeader";
import CategoryTable from "./components/CategoryTable";
import CategoryFormModal from "./components/CategoryFormModal";
import { useCategories, type CategoryFormValues } from "./useCategories";
import { useHeaderControls } from "../../../hooks/useHeaderControls";
import { useTableController } from "../../../hooks/useTableController";
import { useFormModal } from "../../../hooks/useFormModal";

type ModalMode = "create" | "edit";

const CategoryPage: React.FC = () => {
  const {
    filtered,
    parentOptions,
    parentNameById,
    loading,
    query,
    setQuery,
    load,
    remove,
    toggleActive,
    create,
    update,
  } = useCategories();

  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [current, setCurrent] = useState<ICategory | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();

  const header = useHeaderControls({
    initialQuery: query,
    onRefresh: load,
    onCreate: () => handleCreate(),
  });

  const table = useTableController({ data: filtered, pageSize: 10 });

  const formModal = useFormModal<CategoryFormValues>({
    form,
    initialValues: { isActive: true },
    onSubmit: async (values) => {
      if (modalMode === "create") {
        await create(values);
      } else if (modalMode === "edit" && current) {
        await update(current.categoryId, values);
      }
    },
  });

  const handleCreate = () => {
    setModalMode("create");
    setCurrent(null);
    formModal.show({ isActive: true });
  };

  const handleEdit = (record: ICategory) => {
    setModalMode("edit");
    setCurrent(record);
    formModal.show({
      name: record.name,
      parentId: record.parentId,
      imageUrl: record.imageUrl,
      description: record.description,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
    });
  };

  const onSubmit = async () => {
    await formModal.submit();
    setCurrent(null);
  };

  return (
    <div className="p-4">
      <CategoryHeader
        query={header.query as string}
        onQueryChange={(q) => {
          header.onQueryChange(q as any);
          setQuery(q as string);
        }}
        onRefresh={header.onRefresh}
        onCreate={header.onCreate}
      />

      <CategoryTable
        data={table.data}
        loading={loading}
        parentNameById={parentNameById}
        onEdit={handleEdit}
        onDelete={remove}
        onToggleActive={toggleActive}
      />

      <CategoryFormModal
        open={formModal.open}
        loading={formModal.submitting}
        mode={modalMode}
        form={form}
        parentOptions={parentOptions}
        currentId={current?.categoryId}
        onCancel={() => {
          formModal.hide();
          setCurrent(null);
        }}
        onOk={onSubmit}
      />
    </div>
  );
};

export default CategoryPage;

