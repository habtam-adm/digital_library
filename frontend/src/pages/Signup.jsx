import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetchDepartments, signup } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

const emptyForm = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  university_id: "",
  phone: "",
  role: "student",
  department_id: "",
};

export default function Signup() {
  const { t, localized } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments().then(({ data }) => setDepartments(data.departments)).catch(() => {});
  }, []);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError(t("confirm_password"));
      return;
    }
    setLoading(true);
    try {
      const { data } = await signup({
        ...form,
        department_id: form.department_id || null,
      });
      navigate("/verify-email", {
        state: { email: form.email, code: data.verification_code },
      });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", mt: 4 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t("signup_title")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label={t("full_name")}
              required
              value={form.full_name}
              onChange={update("full_name")}
            />
            <TextField
              label={t("email")}
              type="email"
              required
              value={form.email}
              onChange={update("email")}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("password")}
                type="password"
                required
                fullWidth
                value={form.password}
                onChange={update("password")}
              />
              <TextField
                label={t("confirm_password")}
                type="password"
                required
                fullWidth
                value={form.confirm_password}
                onChange={update("confirm_password")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("university_id")}
                helperText={t("university_id_hint")}
                fullWidth
                value={form.university_id}
                onChange={update("university_id")}
              />
              <TextField
                label={t("phone")}
                fullWidth
                value={form.phone}
                onChange={update("phone")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label={t("role")}
                fullWidth
                value={form.role}
                onChange={update("role")}
              >
                <MenuItem value="student">{t("role_student")}</MenuItem>
                <MenuItem value="instructor">{t("role_instructor")}</MenuItem>
              </TextField>
              <TextField
                select
                label={t("department")}
                fullWidth
                value={form.department_id}
                onChange={update("department_id")}
              >
                <MenuItem value="">-</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {localized(department, "name")}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? t("loading") : t("nav_signup")}
            </Button>
          </Stack>
        </Box>

        <Link component={RouterLink} to="/login" sx={{ display: "block", mt: 2 }}>
          {t("have_account")}
        </Link>
      </Paper>
    </Box>
  );
}
