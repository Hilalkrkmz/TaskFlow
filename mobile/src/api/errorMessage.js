// axios'un çiğ hatalarını ("timeout of 15000ms exceeded", "Network Error")
// kullanıcıya gösterilecek anlaşılır bir mesaja çeviriyor. Backend'den gelen
// gerçek bir hata mesajı varsa (err.response.data.error) o zaten anlamlı,
// ona dokunmuyoruz - sadece istek sunucuya hiç ulaşmadıysa/zaman aşımına
// uğradıysa devreye giriyor.
const NO_CONNECTION_MESSAGE = "No internet connection. Please check your connection and try again.";

export function getErrorMessage(err, fallback) {
    const isTimeout = err.code === "ECONNABORTED";
    const isNoResponse = !err.response && err.message === "Network Error";

    if (isTimeout || isNoResponse) {
        return NO_CONNECTION_MESSAGE;
    }

    return err.response?.data?.error || fallback;
}
