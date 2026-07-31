import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { verifyEmail } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

export default function VerifyEmail() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(location.state?.code || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await verifyEmail({ email, code });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <Box sx={{ maxWidth: 460, mx: "auto", mt: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("verify_title")}
        </Typography>
        {location.state?.code && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t("verification_code")}: {location.state.code}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label={t("email")}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label={t("verification_code")}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <Button type="submit" variant="contained">
              {t("verify")}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
