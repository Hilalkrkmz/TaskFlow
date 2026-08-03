import { useState } from "react";
import { LogOut, KeyRound } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

function Profile({ currentUser, onLogout }) {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Bu endpoint'i henüz backend'de yazmadık - bir sonraki adımda ekleyeceğiz.
            await axiosInstance.patch("/users/me/password", {
                oldPassword,
                newPassword,
                confirmNewPassword,
            });

            setSuccess("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowChangePassword(false);
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
        <div className="profile-page">
            <h2 className="profile-title">Profile</h2>

            <div className="profile-card">
                <div className="profile-field">
                    <span className="profile-field-label">Full Name</span>
                    <span className="profile-field-value">{currentUser.fullName}</span>
                </div>
                <div className="profile-field">
                    <span className="profile-field-label">Email</span>
                    <span className="profile-field-value">{currentUser.email}</span>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-row">
                    <div>
                        <p className="profile-row-title">Password</p>
                        <p className="profile-row-desc">Change your account password.</p>
                    </div>
                    <button
                        className="profile-action-btn"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                        <KeyRound size={15} /> Change Password
                    </button>
                </div>

                {showChangePassword && (
                    <form onSubmit={handleChangePassword} className="profile-password-form">
                        <input
                            type="password"
                            placeholder="Current password"
                            className="auth-input"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            className="auth-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            className="auth-input"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}
                        {success && <p className="profile-success">{success}</p>}

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>

            <div className="profile-card">
                <div className="profile-row">
                    <div>
                        <p className="profile-row-title">Log Out</p>
                        <p className="profile-row-desc">Sign out of your TaskFlow account on this device.</p>
                    </div>
                    <button className="settings-danger-btn" onClick={onLogout}>
                        <LogOut size={15} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;