import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const shopApi = createApi({
  reducerPath: 'shopApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPublicShopTheme: builder.query<IApiResponse<ITheme>, string>({
      query: (shopId) => `/shops/${shopId}/theme`,
      transformResponse: (response: IApiResponse<ITheme>) => response,
    }),
  }),
});

export const { useGetPublicShopThemeQuery } = shopApi;
