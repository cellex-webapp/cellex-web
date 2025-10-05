export type ApiCode = number; 

export interface ApiResponse<T = unknown> {
	code: ApiCode;
	message: string;
	result: T;
}

export const isApiSuccess = (res: ApiResponse<any>) => res.code === 200;

