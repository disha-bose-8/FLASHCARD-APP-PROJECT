import React, { useState, useEffect } from "react"; 
import "../css/settings.css";
import { useOutletContext } from "react-router-dom";

const API = `${import.meta.env.VITE_API_URL}/api`;

function Settings() {
    const outletContext = useOutletContext();
    const setPageTitle = outletContext?.setPageTitle || (() => {});
    
    // Set page title
    useEffect(() => {
        setPageTitle("Settings");
    }, [setPageTitle]);

    // Get user from localStorage safely
    const [user, setUser] = useState(null);
    
    // Load user from localStorage after component mounts
    useEffect(() => {
        try {
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }, []);

    // --- STATES ---
    const [emailData, setEmailData] = useState({
        newEmail: "",
        confirmEmail: "",
        currentPassword: "",
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
    });

    const [message, setMessage] = useState("");

    // INPUT HANDLERS
    const handleEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    // --- UPDATE EMAIL ---
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is available
        if (!user) {
            setMessage("❌ User not found. Please log in again.");
            return;
        }

        const { newEmail, confirmEmail, currentPassword } = emailData;

        if (!newEmail || !confirmEmail || !currentPassword)
            return setMessage("⚠️ Please fill all fields.");
        if (newEmail !== confirmEmail)
            return setMessage("⚠️ New emails do not match.");

        console.log("EMAIL REQUEST SENDING:", {
            userId: user._id,
            newEmail,
            currentPassword,
        });

        try {
            const res = await fetch(`${API}/users/update-email`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    newEmail,
                    currentPassword,
                }),
            });

            const data = await res.json();
            setMessage(data.message);

            if (res.ok) {
                setEmailData({
                    newEmail: "",
                    confirmEmail: "",
                    currentPassword: "",
                });
                
                // Update user in localStorage if email was changed successfully
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                }
            }
        } catch (err) {
            console.log("FRONTEND EMAIL ERROR:", err);
            setMessage("❌ Error updating email.");
        }
    };

    // --- UPDATE PASSWORD ---
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is available
        if (!user) {
            setMessage("❌ User not found. Please log in again.");
            return;
        }

        const { newPassword, confirmPassword, currentPassword } = passwordData;

        if (!newPassword || !confirmPassword || !currentPassword)
            return setMessage("⚠️ Please fill all fields.");
        if (newPassword !== confirmPassword)
            return setMessage("⚠️ Passwords do not match.");
        if (newPassword.length < 6)
            return setMessage("⚠️ Password should be at least 6 characters.");

        console.log("PASSWORD REQUEST SENDING:", {
            userId: user._id,
            newPassword,
            currentPassword
        });

        try {
            const res = await fetch(`${API}/users/update-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    newPassword,
                    currentPassword,
                }),
            });

            const data = await res.json();
            setMessage(data.message);

            if (res.ok) {
                setPasswordData({
                    newPassword: "",
                    confirmPassword: "",
                    currentPassword: "",
                });
            }
        } catch (err) {
            console.log("FRONTEND PASSWORD ERROR:", err);
            setMessage("❌ Error updating password.");
        }
    };

    if (!user) {
        return <h2 className="settings-title">Loading...</h2>;
    }

    return (
        <div className="settings-container">

            <div className="settings-wrapper">

                {/* --- CHANGE EMAIL --- */}
                <div className="settings-card">
                    <h3>Change Email</h3>
                    <form onSubmit={handleEmailSubmit}>
                        <label>New Email</label>
                        <input
                            type="email"
                            name="newEmail"
                            value={emailData.newEmail}
                            onChange={handleEmailChange}
                            placeholder="Enter new email"
                        />

                        <label>Confirm New Email</label>
                        <input
                            type="email"
                            name="confirmEmail"
                            value={emailData.confirmEmail}
                            onChange={handleEmailChange}
                            placeholder="Re-enter new email"
                        />

                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={emailData.currentPassword}
                            onChange={handleEmailChange}
                            placeholder="Enter your password"
                        />

                        <button type="submit" className="settings-btn">
                            Change Email
                        </button>
                    </form>
                </div>

                {/* --- CHANGE PASSWORD --- */}
                <div className="settings-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordSubmit}>
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                        />

                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Re-enter new password"
                        />

                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your current password"
                        />

                        <button type="submit" className="settings-btn">
                            Change Password
                        </button>
                    </form>
                </div>

            </div>

            {message && <p className="settings-message">{message}</p>}
        </div>
    );
}

export default Settings;