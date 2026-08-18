// axios'un çiğ hatalarını ("timeout of 15000ms exceeded", "Network Error")
// kullanıcıya gösterilecek anlaşılır bir mesaja çeviriyor - mobile'daki
// src/api/errorMessage.js ile birebir aynı mantık.
const NO_CONNECTION_MESSAGE = "No internet connection. Please check your connection and try again.";

export function getErrorMessage(err, fallback) {
    const isTimeout = err.code === "ECONNABORTED";
    const isNoResponse = !err.response && err.message === "Network Error";

    if (isTimeout || isNoResponse) {
        return NO_CONNECTION_MESSAGE;
    }

    return err.response?.data?.error || fallback;
}
