import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3000/api", //chiral backend server
});

// Add request interceptor to include auth token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
