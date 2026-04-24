import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        // save user
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful 🚀");

        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      alert("Server not reachable ❌");
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
