import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../css/Register.css";

const NUM_CARDS = 25;

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const colors = ["#34d399", "#f472b6", "#60a5fa", "#facc15", "#a78bfa"];

  const renderFlashcards = () =>
    Array.from({ length: NUM_CARDS }, (_, i) => {
      const left = Math.random() * 100 + "%";
      const top = Math.random() * 100 + "%";
      const duration = 18 + Math.random() * 10 + "s";
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
          <div className="card-front">Q??</div>
          <div className="card-back">A</div>
        </div>
      );
    });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log(data);

            if (res.ok) {
                navigate("/login");
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    return (
    <div className="register-page-container">
      <div className="register-bg">{renderFlashcards()}</div>

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="register-title">Create Account</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>

        <p className="login-redirect">
          Already have an account?
          <Link to="/login" className="login-link">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;