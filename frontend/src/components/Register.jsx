import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Register({ onRegisterSubmitted, onSwitchToLogin }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Register artık token değil, "check your email" mesajı dönüyor.
            await axiosInstance.post("/auth/register", {
                fullName,
                email,
                password,
                confirmPassword,
            });

            // App.jsx'e "kayıt gönderildi, şimdi bu email için doğrulama ekranına geç" diyoruz.
            onRegisterSubmitted(email);

        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Create your account</h2>
                <p className="auth-subtitle">Start managing your tasks with TaskFlow</p>

                <form onSubmit={handleRegister}>
                    <label className="auth-label">Full Name</label>
                    <input
                        type="text"
                        className="auth-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

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

                    <label className="auth-label">Confirm Password</label>
                    <input
                        type="password"
                        className="auth-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="auth-switch-text">
                    Already have an account?{" "}
                    <span className="auth-switch-link" onClick={onSwitchToLogin}>
                        Log in
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;