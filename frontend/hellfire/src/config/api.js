import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // ✅ cookies carry auth
});


// ✅ Simple response interceptor (NO token logic)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or not logged in
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
