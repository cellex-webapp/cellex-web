declare global {
  interface ICategory {
    categoryId: string;
    name: string;
    parentId?: string;
    imageUrl?: string;
    description?: string;
    isActive: boolean;
    sortOrder?: number;
    createdAt: string;
    updatedAt: string;
  }
}