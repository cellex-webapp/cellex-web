import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from '@/stores/store';

const selectCategory = (state: RootState) => state.category;

export const selectAllCategories = createSelector(
  [selectCategory],
  (categoryState) => categoryState.categories
);

export const selectCategoryIsLoading = createSelector(
  [selectCategory],
  (categoryState) => categoryState.isLoading
);

export const selectCategoryError = createSelector(
  [selectCategory],
  (categoryState) => categoryState.error
);

export const selectCategoryPagination = createSelector(
  [selectCategory],
  (categoryState) => categoryState.pagination
);

export interface ICategoryTree extends ICategory {
  children: ICategoryTree[];
}

const buildCategoryTree = (categories: ICategory[]): ICategoryTree[] => {
  const map = new Map<string, ICategoryTree>();
  const roots: ICategoryTree[] = [];
  if (!Array.isArray(categories)) return [];

  categories.forEach((cat) => {
    map.set(cat.id, { 
      ...cat, 
      children: [] 
    } as ICategoryTree); 
  });

  categories.forEach((cat) => {
    const node = map.get(cat.id);
    if (node) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
};

export const selectCategoryTree = createSelector(
  [selectAllCategories],
  (categories) => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    return buildCategoryTree(categories);
  }
);