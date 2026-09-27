
// src/services/media.js
import api from "./api";

export const newsService = {
  getNews: () => api.get("/news"),
  getNewsById: (id) => api.get(`/news/${id}`),
  insertNews: (formData) =>
    api.post("/news", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateNews: (id, formData) =>
    api.put(`/news/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteNews: (id) => api.delete(`/news/${id}`),
};

export const newsDetailService = {
  getNewsDetails: () => api.get("/newsdetails"),
  getNewsDetailById: (id) => api.get(`/newsdetails/${id}`),
  insertNewsDetail: (data) => api.post("/newsdetails", data),
  updateNewsDetail: (id, data) => api.put(`/newsdetails/${id}`, data),
  deleteNewsDetail: (id) => api.delete(`/newsdetails/${id}`),
};

export const bannerService = {
  getBanners: () => api.get("/banners"),
  getBannerById: (id) => api.get(`/banners/${id}`),
  insertBanner: (formData) =>
    api.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBanner: (id, formData) =>
    api.put(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
};

export const bannerDetailService = {
  getBannerDetails: () => api.get("/bannerdetails"),
  getBannerDetailById: (id) => api.get(`/bannerdetails/${id}`),
  insertBannerDetail: (data) => api.post("/bannerdetails", data),
  updateBannerDetail: (id, data) => api.put(`/bannerdetails/${id}`, data),
  deleteBannerDetail: (id) => api.delete(`/bannerdetails/${id}`),
};

export const imageService = {
  getAllImages: () => api.get("/images"),
  viewImage: (filename) =>
    `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/images/${filename}`,
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadToGoogle: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post("/images/google/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const productImageService = {
  getProductImages: () => api.get("/product-images"),
  getProductImageById: (id) => api.get(`/product-images/${id}`),
  insertProductImage: (data) => api.post("/product-images", data),
  deleteProductImage: (id) => api.delete(`/product-images/${id}`),
};

