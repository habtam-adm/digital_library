import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Box, TextField, Button, Typography, Alert, Link } from "@mui/material";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: request code, Step 2: reset password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Step 1: Request reset code
  const handleRequestCode = async () => {
    setMessage(""); setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification code sent to your email.");
        setStep(2);
      } else {
        setError(data.error || "Failed to send code. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async () => {
    setMessage(""); setError("");
    if (!code || !newPassword) {
      setError("Please enter both code and new password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successful!");
        setStep(1);
        setEmail(""); setCode(""); setNewPassword("");
      } else {
        setError(data.error || "Failed to reset password. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" mb={2}>
          Forgot Password
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === 2}
        />

        {step === 2 && (
          <>
            <TextField
              label="Verification Code"
              fullWidth
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={step === 1 ? handleRequestCode : handleResetPassword}
        >
          {step === 1 ? "Send Verification Code" : "Reset Password"}
        </Button>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link component={RouterLink} to="/login">
            Back to Login
          </Link>
        </Box>
      </Box>
    </Container>
  );
}