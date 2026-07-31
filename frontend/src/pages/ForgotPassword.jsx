import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { requestReset, resetPassword } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

export default function ForgotPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({ email: "", code: "", new_password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const sendCode = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await requestReset({ email: form.email });
      setForm((current) => ({ ...current, code: data.reset_code || "" }));
      setMessage(`${data.message} ${data.reset_code ? data.reset_code : ""}`);
      setStep("reset");
    } catch (err) {
      setError(apiError(err));
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await resetPassword(form);
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
          {t("forgot_title")}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {step === "request" ? (
          <Box component="form" onSubmit={sendCode}>
            <Stack spacing={2}>
              <TextField
                label={t("email")}
                type="email"
                required
                value={form.email}
                onChange={update("email")}
              />
              <Button type="submit" variant="contained">
                {t("send_code")}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box component="form" onSubmit={changePassword}>
            <Stack spacing={2}>
              <TextField
                label={t("verification_code")}
                required
                value={form.code}
                onChange={update("code")}
              />
              <TextField
                label={t("new_password")}
                type="password"
                required
                value={form.new_password}
                onChange={update("new_password")}
              />
              <Button type="submit" variant="contained">
                {t("save")}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
