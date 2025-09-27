declare global {
  interface ICategory {
    _id: string;
    name: string;
    parent_id?: string;
    image_url: string;
    description: string;
  }
  interface ICategory {
    is_active: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
    }
}