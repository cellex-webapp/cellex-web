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

export interface ICategoryTree extends ICategory {
  children: ICategoryTree[];
}

const buildCategoryTree = (categories: ICategory[]): ICategoryTree[] => {
  const map: { [key: string]: ICategoryTree } = {};
  const tree: ICategoryTree[] = [];

  categories.forEach((category) => {
    map[category.id] = { ...category, children: [] };
  });

  Object.values(map).forEach((node) => {
    if (node.parentId && map[node.parentId]) {
      map[node.parentId].children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

export const selectCategoryTree = createSelector(
  [selectAllCategories],
  (categories) => {
    if (!categories || categories.length === 0) {
      return [];
    }
    return buildCategoryTree(categories);
  }
);