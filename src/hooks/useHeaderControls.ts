import { useCallback, useState } from "react";

export interface HeaderControlsOptions<TQuery = string> {
  initialQuery?: TQuery;
  onRefresh?: () => void | Promise<void>;
  onCreate?: () => void;
}

export function useHeaderControls<TQuery = string>(options?: HeaderControlsOptions<TQuery>) {
  const [query, setQuery] = useState<TQuery>((options?.initialQuery ?? ("" as unknown as TQuery)));

  const handleQueryChange = useCallback((q: TQuery) => {
    setQuery(q);
  }, []);

  const handleRefresh = useCallback(() => {
    return options?.onRefresh?.();
  }, [options]);

  const handleCreate = useCallback(() => {
    options?.onCreate?.();
  }, [options]);

  return {
    query,
    setQuery,
    onQueryChange: handleQueryChange,
    onRefresh: handleRefresh,
    onCreate: handleCreate,
  } as const;
}
