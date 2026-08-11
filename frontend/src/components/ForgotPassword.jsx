import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import OtpInput from "./OtpInput";

// 3 adım:
// step 1: email gir -> kod gönderilsin
// step 2: kodu gir -> backend'e "geçerli mi" diye sor, geçerliyse step 3'e geç
// step 3: yeni şifre + tekrar gir -> gerçekten değiştir
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

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");
        setLoading(true);

        try {
            // Kod sadece kontrol ediliyor, henüz şifre değişmiyor.
            await axiosInstance.post("/auth/verify-reset-code", { email, code });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired code.");
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
                    {step === 1 && "Reset your password"}
                    {step === 2 && "Enter verification code"}
                    {step === 3 && "Set a new password"}
                </h2>

                {step === 1 && (
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
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyCode}>
                        <p className="auth-switch-text" style={{ marginTop: 0, marginBottom: 16 }}>
                            We sent a code to <strong>{email}</strong>
                        </p>

                        <label className="auth-label" style={{ textAlign: "center" }}>Verification Code</label>
                        <OtpInput length={6} value={code} onChange={setCode} />

                        {error && <p className="auth-error" style={{ textAlign: "center" }}>{error}</p>}

                        <button type="submit" className="auth-submit-btn" disabled={loading || code.length !== 6}>
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
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