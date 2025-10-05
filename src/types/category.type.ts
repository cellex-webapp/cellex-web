export interface BackendCategory {
  id: string;
  name: string;
  imageUrl?: string | null;
  parent?: BackendCategory | null; // nested parent
  active?: boolean;
}

export interface CategoryRef {
  id: string;
  name: string;
}

export interface AppCategory {
  id: string;
  name: string;
  imageUrl?: string | null;
  parent?: CategoryRef | null;
  active: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: string | null;
  isActive?: boolean;
  image?: File | Blob | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  parentId?: string | null;
  isActive?: boolean;
  image?: File | Blob | null;
}

export function mapBackendCategory(c: BackendCategory): AppCategory {
  return {
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl ?? null,
    parent: c.parent ? { id: c.parent.id, name: c.parent.name } : null,
    active: Boolean(c.active),
  };
}
