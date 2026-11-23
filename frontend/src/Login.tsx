import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/token/`,
        { username, password }
      );

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      navigate("/", { replace: true });
    } catch {
      setError("Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f4f7f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <form onSubmit={handleSubmit} style={{
        width: "360px",
        padding: "36px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ color: "#176b4d" }}>SquareOne</h1>
        <h2>Staff Sign In</h2>
        <p>Sign in to access the Student Progress Management portal.</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          style={{ width: "100%", padding: "10px", margin: "8px 0 18px", boxSizing: "border-box" }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ width: "100%", padding: "10px", margin: "8px 0 18px", boxSizing: "border-box" }}
        />

        {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          width: "100%",
          padding: "12px",
          background: "#176b4d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
