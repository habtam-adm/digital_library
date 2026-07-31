import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { apiError } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 460, mx: "auto", mt: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("login_title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("app_name")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label={t("email")}
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <TextField
              label={t("password")}
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? t("loading") : t("nav_login")}
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/signup">
            {t("no_account")}
          </Link>
          <Link component={RouterLink} to="/forgot-password">
            {t("forgot_link")}
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
}
