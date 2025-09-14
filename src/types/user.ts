export type UserRole = "admin" | "client" | "vendor" | "guest";

export interface IFetchUser {
  userId: string;
  username: string;
  role: UserRole;
}
