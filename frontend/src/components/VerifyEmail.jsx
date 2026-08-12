import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import OtpInput from "./OtpInput";

function VerifyEmail({ email, onVerifySuccess, onBackToLogin }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/verify-email", { email, code });
            const { token, fullName, email: userEmail, theme } = response.data;

            localStorage.setItem("token", token);
            onVerifySuccess({ fullName, email: userEmail, theme });
        } catch (err) {
            setError(err.response?.data?.error || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setInfo("");
        setResending(true);

        try {
            const response = await axiosInstance.post("/auth/resend-verification", { email });
            setInfo(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || "Could not resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Verify your email</h2>
                <p className="auth-subtitle">
                    We sent a 6-digit code to <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerify}>
                    <label className="auth-label" style={{ textAlign: "center" }}>Verification Code</label>
                    <OtpInput length={6} value={code} onChange={setCode} />

                    {error && <p className="auth-error" style={{ textAlign: "center" }}>{error}</p>}
                    {info && <p className="profile-success" style={{ textAlign: "center" }}>{info}</p>}

                    <button type="submit" className="auth-submit-btn" disabled={loading || code.length !== 6}>
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                <p className="auth-switch-text">
                    Didn't get a code?{" "}
                    <span className="auth-switch-link" onClick={handleResend}>
                        {resending ? "Sending..." : "Resend code"}
                    </span>
                </p>

                <p className="auth-switch-text">
                    <span className="auth-switch-link" onClick={onBackToLogin}>
                        Back to login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default VerifyEmail;