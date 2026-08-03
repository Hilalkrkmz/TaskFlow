import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Register({ onRegisterSuccess, onSwitchToLogin }) {
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
            // Backend'deki RegisterRequest DTO'suyla birebir eşleşen alanları gönderiyoruz.
            const response = await axiosInstance.post("/auth/register", {
                fullName,
                email,
                password,
                confirmPassword,
            });

            // Yani register olan kişi ayrıca login yapmak zorunda kalmaz, direkt giriş yapmış sayılır.
            const { token, fullName: returnedFullName, theme } = response.data;

            localStorage.setItem("token", token);

            onRegisterSuccess({ fullName: returnedFullName, theme });

        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Create your TaskFlow account</h2>

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