import axios from "axios";

import authService from "./auth";

const api = axios.create({
  baseURL: process.env.BACKEND_API_URI
});

api.interceptors.request.use(async config => {
  const { getToken } = authService();
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
