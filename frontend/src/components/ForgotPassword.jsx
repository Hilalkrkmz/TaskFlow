import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

// Bu component iki adımı tek dosyada yönetiyor:
// step 1: email gir -> kod gönderilsin
// step 2: kod + yeni şifre gir -> şifre değişsin
function ForgotPassword({ onBackToLogin }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/forgot-password", { email });
            setInfo(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/reset-password", {
                email,
                code,
                newPassword,
                confirmNewPassword,
            });
            setInfo(response.data.message);

            // Kısa bir bekleme sonrası login ekranına dön.
            setTimeout(() => {
                onBackToLogin();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">
                    {step === 1 ? "Reset your password" : "Enter code & new password"}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleSendCode}>
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Sending..." : "Send Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <label className="auth-label">Verification Code</label>
                        <input
                            type="text"
                            className="auth-input"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            required
                        />

                        <label className="auth-label">New Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <label className="auth-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}
                        {info && <p className="profile-success">{info}</p>}

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="auth-switch-text">
                    <span className="auth-switch-link" onClick={onBackToLogin}>
                        Back to login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;