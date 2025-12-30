import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  // Axios error shapes
  if ((error as any)?.isAxiosError || error instanceof AxiosError) {
    const axiosError = error as AxiosError<any>;
    const msg = axiosError.response?.data?.message ?? axiosError.message;
    return msg || 'An API error occurred';
  }

  // Native Error
  if (error instanceof Error) {
    return error.message;
  }

  // String message
  if (typeof error === 'string') {
    return error;
  }

  // Generic object: prefer top-level message or common nests
  if (error && typeof error === 'object') {
    const e: any = error;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.data?.message === 'string') return e.data.message;
    if (typeof e.response?.data?.message === 'string') return e.response.data.message;
  }

  // Fallback to generic text (avoid dumping JSON to users)
  return 'Đã xảy ra lỗi';
};