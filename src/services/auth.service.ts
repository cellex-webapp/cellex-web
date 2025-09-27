import instance from "./axios-instance";

export async function loginAPI(credentials: LoginCredentials): Promise<ILoginResponse> {
  const response = await instance.post<ILoginResponse>("/auth/login", credentials);
  return response.data;
}

export async function logoutAPI(): Promise<void> {
  await instance.post<void>("/auth/logout");
}