import axios from "axios";

// Backend artık Railway'de (cloud) çalışıyor - localhost'a değil oraya bağlanıyoruz,
// böylece hem Electron hem web hangi bilgisayarda çalışırsa çalışsın erişebiliyor.
const axiosInstance = axios.create({
    baseURL: "https://taskflow-production-3c7d.up.railway.app/api",
    timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstance;