import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// 🔥 AUTO ATTACH TOKEN TO EVERY REQUEST
API.interceptors.request.use((config) => {

  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);


export default API;
