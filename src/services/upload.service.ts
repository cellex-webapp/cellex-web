import axiosInstance from "@/utils/axiosInstance";

export const uploadService = {
  upload: async (file: File, folder: string = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post<IApiResponse<string>>('/upload', formData, {
      params: { folder },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default uploadService;
