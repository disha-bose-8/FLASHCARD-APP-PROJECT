import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";

const NUM_CARDS = 25;

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();

    // State for form
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Submit login
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = formData;

        try {
            const res = await fetch("https://flashcard-app-project-u8zp.onrender.com/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log("Login Response:", data);

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user)); // SAVE USER
                if (onLoginSuccess) onLoginSuccess();
                navigate("/login/home");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const colors = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#facc15"];

    const renderFlashcards = () =>
        Array.from({ length: NUM_CARDS }, (_, i) => {
            const left = Math.random() * 100 + "%";
            const top = Math.random() * 100 + "%";
            const duration = 20 + Math.random() * 15 + "s";
            const delay = Math.random() * 5 + "s";
            const rotateX = Math.random() * 360;
            const rotateY = Math.random() * 360;
            const depth = Math.random() * 200 - 100;
            const color = colors[Math.floor(Math.random() * colors.length)];

            return (
                <div
                    key={i}
                    className="floating-card"
                    style={{
                        left,
                        top,
                        animationDuration: duration,
                        animationDelay: delay,
                        transform: `translateZ(${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                        "--card-color": color,
                    }}
                >
                    <div className="card-front">Q?</div>
                    <div className="card-back">A.</div>
                </div>
            );
        });

    return (
        <div className="login-page-container">
            <div className="enhanced-bg">{renderFlashcards()}</div>

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h1 className="login-title">Welcome!</h1>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <i className="fa fa-user input-icon"></i>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa fa-lock input-icon"></i>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">Log In</button>
                </form>

                <p className="signup-text">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
