import axios from "axios";
import { API_BASE_URL } from "./config";
import { getToken } from "../auth/tokenStorage";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    // Varsayılanda axios'ta timeout yok (0 = sonsuz bekler) - LAN_IP yanlış/
    // erişilemez olduğunda istek hiç hata vermeden sonsuza kadar "yükleniyor"
    // durumunda kalıyordu (RootNavigator'daki authChecking hiç false olmuyordu).
    timeout: 15000,
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