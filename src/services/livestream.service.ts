import axiosInstance from "@/utils/axiosInstance";

export const livestreamService = {
  getActiveSessions: async () => {
    const response = await axiosInstance.get<IApiResponse<ILivestreamSession[]>>('/livestream/sessions/active');
    return response.data;
  },

  getViewerToken: async (sessionId: string) => {
    const response = await axiosInstance.get<IApiResponse<string>>(`/livestream/sessions/${sessionId}/viewer-token`);
    return response.data;
  }
};

export default livestreamService;