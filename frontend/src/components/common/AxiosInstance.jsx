import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('learnhub_user') || '{}');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default axiosInstance;
