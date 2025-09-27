import { useCallback, useMemo, useState } from "react";
import type { TablePaginationConfig } from "antd";
import type { SorterResult, FilterValue } from "antd/es/table/interface";

export interface TableControllerOptions<T> {
  data: T[];
  pageSize?: number;
}

export function useTableController<T>(options: TableControllerOptions<T>) {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: options.pageSize ?? 10,
    showSizeChanger: true,
  });
  const [sorter, setSorter] = useState<SorterResult<T> | SorterResult<T>[]>({} as any);
  const [filters, setFilters] = useState<Record<string, FilterValue | null>>({});

  const pagedData = useMemo(() => {
    // Let antd handle actual pagination; this is a placeholder if custom paging is needed
    return options.data;
  }, [options.data]);

  const onChange = useCallback(
    (newPagination: TablePaginationConfig, newFilters: Record<string, FilterValue | null>, newSorter: SorterResult<T> | SorterResult<T>[]) => {
      setPagination(newPagination);
      setFilters(newFilters);
      setSorter(newSorter);
    },
    []
  );

  return {
    data: pagedData,
    pagination,
    sorter,
    filters,
    onChange,
    setPagination,
    setFilters,
    setSorter,
  } as const;
}
