import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Box, TextField, Button, Typography, Alert, Link } from "@mui/material";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setMessage("");
    setError("");

    if (!email || !code) {
      setError("Please enter both email and verification code.");
      return;
    }

    try {
      // Replace with your backend API call
      const response = await fetch("https://yourapi.com/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Email verified successfully!");
      } else {
        setError(data.error || "Verification failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" mb={2}>
          Email Verification
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
        />

        <TextField
          label="Verification Code"
          fullWidth
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleVerify}
        >
          Verify Email
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