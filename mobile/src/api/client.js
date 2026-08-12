import axios from "axios";
import { API_BASE_URL } from "./config";
import { getToken } from "../auth/tokenStorage";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Web'deki axiosInstance.js'te bu interceptor SENKRONDU çünkü localStorage
// senkron. Burada SecureStore async olduğu için interceptor da async -
// axios bunu destekliyor, config'i bir Promise olarak da dönebiliyoruz.
apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default apiClient;