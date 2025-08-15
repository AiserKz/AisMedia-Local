import axios from "axios";
import { API_BASE_URL } from "../config";


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});


api.interceptors.request.use(config => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401) {
            try {
                const refresh = localStorage.getItem("refresh");
                if (refresh) {
                    const res = await axios.post(API_BASE_URL + "/api/token/refresh/", { refresh: refresh });
                    localStorage.setItem("access", res.data.access);

                    error.config.headers.Authorization = `Bearer ${res.data.access}`;
                    return api.request(error.config);
                }
            } catch (err) {
                console.error("Ошибка обновления токена");
            }
        }
        return Promise.reject(error);
    }
)

export default api