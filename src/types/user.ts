export type UserRole = "admin" | "client" | "vendor";

export interface IFetchUser {
  userId: string;
  username: string;
  role: UserRole;
}
