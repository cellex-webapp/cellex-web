/**
 * Tìm kiếm sản phẩm bằng hình ảnh upload.
 * @param file File ảnh từ người dùng
 * @param topK Số kết quả tối đa (default 20)
 */
export const searchProductsByImage = async (
  file: File,
  topK: number = 20
): Promise<{ success: boolean; products: any[]; total: number; message: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/products/image-search?top_k=${topK}`,
    {
      method: "POST",
      body: formData,
      headers: headers,
      // KHÔNG set Content-Type header - browser tự set multipart boundary
    }
  );

  if (!response.ok) {
    throw new Error(`Image search failed: HTTP ${response.status}`);
  }

  return response.json();
};
