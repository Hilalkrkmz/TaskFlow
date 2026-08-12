import * as SecureStore from "expo-secure-store";

// localStorage.getItem/setItem SENKRON çalışır. SecureStore ise ASENKRON
// (native keychain/keystore'a şifreli okuma/yazma yaptığı için Promise döner).
// Bu yüzden axios interceptor'ı da async olmak zorunda (client.js'e bak).

const TOKEN_KEY = "taskflow_token";

export async function getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function deleteToken() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
}