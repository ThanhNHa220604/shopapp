import api from "./api";

const contentService = {
  // Banner
  getBanners: async () => {
    const response = await api.get("/banners");
    return response.data;
  },

  // News list
  getNews: async (params) => {
    const response = await api.get("/news", { params });
    return response.data;
  },

  // News detail
  getNewsDetail: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
};

export default contentService;
