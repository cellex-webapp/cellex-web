import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import {
  createCategoryAPI,
  deleteCategoryAPI,
  fetchCategoriesAPI,
  updateCategoryAPI,
} from "../../../services/categories.service";

export type CategoryFormValues = {
  name: string;
  parentId?: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
};

export function useCategories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategoriesAPI();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Tải danh mục thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const parentOptions = useMemo(
    () => categories.map((c) => ({ value: c.categoryId, label: c.name })),
    [categories]
  );

  const parentNameById = useCallback(
    (id?: string) => (id ? categories.find((c) => c.categoryId === id)?.name : undefined),
    [categories]
  );

  const remove = useCallback(async (record: ICategory) => {
    try {
      await deleteCategoryAPI(record.categoryId);
      message.success("Xóa danh mục thành công");
      setCategories((prev) => prev.filter((c) => c.categoryId !== record.categoryId));
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Xóa danh mục thất bại");
    }
  }, []);

  const toggleActive = useCallback(async (record: ICategory, checked: boolean) => {
    const original = record.isActive;
    setCategories((prev) =>
      prev.map((c) => (c.categoryId === record.categoryId ? { ...c, isActive: checked } : c))
    );
    try {
      await updateCategoryAPI(record.categoryId, { isActive: checked });
      message.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      console.error(err);
      setCategories((prev) =>
        prev.map((c) => (c.categoryId === record.categoryId ? { ...c, isActive: original } : c))
      );
      message.error(err?.message || "Cập nhật trạng thái thất bại");
    }
  }, []);

  const create = useCallback(async (values: CategoryFormValues) => {
    const created = await createCategoryAPI(values);
    setCategories((prev) => [created, ...prev]);
    message.success("Tạo danh mục thành công");
    return created;
  }, []);

  const update = useCallback(async (id: string, values: CategoryFormValues) => {
    const updated = await updateCategoryAPI(id, values);
    setCategories((prev) => prev.map((c) => (c.categoryId === id ? updated : c)));
    message.success("Cập nhật danh mục thành công");
    return updated;
  }, []);

  return {
    categories,
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
  };
}
