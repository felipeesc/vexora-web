// @ts-ignore
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

// @ts-ignore
api.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
