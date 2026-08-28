import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Login({ onLoginSuccess, onSwitchToRegister, onForgotPassword, onNeedsVerification }) {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

     
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); // formun sayfayı yenilemesini engeller (tarayıcının varsayılan davranışı)

        setError("");   // önceki hatayı temizle
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/login", {
                email,
                password,
            });

          
            const { token, fullName, email: userEmail, theme } = response.data;

            localStorage.setItem("token", token);

            onLoginSuccess({ fullName, email: userEmail, theme });

        } catch (err) {
            // Hesap var ama email dogrulanmamis - kullaniciyi hatayla bas basa
            // birakmak yerine yeni bir kod gonderip direkt Verify ekranina goturuyoruz.
            if (err.response?.data?.error === "Please verify your email before logging in") {
                try {
                    await axiosInstance.post("/auth/resend-verification", { email });
                } catch {
                    // Sessizce gec - Verify ekranindaki "Resend code" ile tekrar denenebilir.
                }
                onNeedsVerification(email);
                return;
            }

            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            // Başarılı da olsa hatalı da olsa, loading'i kapat.
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Log in to continue to TaskFlow</p>
 
                <form onSubmit={handleLogin}>
                    <label className="auth-label">Email</label>
                    <input
                        type="email"
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
 
                    <label className="auth-label">Password</label>
                    <input
                        type="password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
 
                    {error && <p className="auth-error">{error}</p>}
 
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
 
                <p className="auth-switch-text">
                    Don't have an account?{" "}
                    <span className="auth-switch-link" onClick={onSwitchToRegister}>
                        Register
                    </span>
                </p>
 
                <p className="auth-switch-text">
                    <span className="auth-switch-link" onClick={onForgotPassword}>
                        Forgot password?
                    </span>
                </p>
            </div>
        </div>
    );
}
 
export default Login;