// Standard API response shape
// {
//   "code": 200,
//   "message": "string",
//   "result": T
// }

export type ApiCode = number; // 200 = success

export interface ApiResponse<T = unknown> {
	code: ApiCode;
	message: string;
	result: T;
}

export const isApiSuccess = (res: ApiResponse<any>) => res.code === 200;

