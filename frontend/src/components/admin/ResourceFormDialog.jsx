import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { createResource, fetchColleges, fetchDepartments, updateResource } from "../../api/library";
import { apiError } from "../../api/client";
import { useI18n } from "../../context/I18nContext";

const TYPES = ["book", "thesis", "journal", "module", "exam", "reference"];
const LANGUAGES = ["en", "am", "or", "ti", "other"];

const emptyResource = {
  title: "",
  title_am: "",
  author: "",
  publisher: "",
  publication_year: "",
  isbn: "",
  language: "en",
  resource_type: "book",
  college_id: "",
  department_id: "",
  subject: "",
  keywords: "",
  abstract: "",
  edition: "",
  pages: "",
  shelf_location: "",
  total_copies: 1,
};

export default function ResourceFormDialog({ open, resource, onClose, onSaved }) {
  const { t, localized } = useI18n();
  const [form, setForm] = useState(emptyResource);
  const [file, setFile] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setFile(null);
    setForm(
      resource
        ? Object.fromEntries(
            Object.keys(emptyResource).map((key) => [key, resource[key] ?? ""]),
          )
        : emptyResource,
    );
  }, [open, resource]);

  useEffect(() => {
    fetchColleges().then(({ data }) => setColleges(data.colleges)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDepartments(form.college_id)
      .then(({ data }) => setDepartments(data.departments))
      .catch(() => {});
  }, [form.college_id]);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null) payload.append(key, value);
      });
      if (file) payload.append("file", file);

      if (resource) await updateResource(resource.id, payload);
      else await createResource(payload);
      onSaved();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{resource ? t("edit_resource") : t("add_resource")}</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Title"
                required
                fullWidth
                value={form.title}
                onChange={update("title")}
              />
              <TextField
                label="ርዕስ (Amharic)"
                fullWidth
                value={form.title_am}
                onChange={update("title_am")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("author")}
                required
                fullWidth
                value={form.author}
                onChange={update("author")}
              />
              <TextField
                label={t("publisher")}
                fullWidth
                value={form.publisher}
                onChange={update("publisher")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label={t("filter_type")}
                fullWidth
                value={form.resource_type}
                onChange={update("resource_type")}
              >
                {TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`type_${type}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t("filter_language")}
                fullWidth
                value={form.language}
                onChange={update("language")}
              >
                {LANGUAGES.map((code) => (
                  <MenuItem key={code} value={code}>
                    {t(`lang_${code}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t("published")}
                type="number"
                fullWidth
                value={form.publication_year}
                onChange={update("publication_year")}
                helperText={
                  form.publication_year
                    ? `${Number(form.publication_year) - 8} E.C.`
                    : " "
                }
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label={t("college")}
                fullWidth
                value={form.college_id}
                onChange={(event) =>
                  setForm({ ...form, college_id: event.target.value, department_id: "" })
                }
              >
                <MenuItem value="">-</MenuItem>
                {colleges.map((college) => (
                  <MenuItem key={college.id} value={college.id}>
                    {localized(college, "name")}
                  </MenuItem>
                ))}
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("subject")}
                fullWidth
                value={form.subject}
                onChange={update("subject")}
              />
              <TextField
                label={t("keywords")}
                fullWidth
                value={form.keywords}
                onChange={update("keywords")}
              />
            </Stack>
            <TextField
              label={t("abstract")}
              multiline
              rows={3}
              value={form.abstract}
              onChange={update("abstract")}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("isbn")}
                fullWidth
                value={form.isbn}
                onChange={update("isbn")}
              />
              <TextField
                label={t("edition")}
                fullWidth
                value={form.edition}
                onChange={update("edition")}
              />
              <TextField
                label={t("pages")}
                type="number"
                fullWidth
                value={form.pages}
                onChange={update("pages")}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("shelf")}
                fullWidth
                value={form.shelf_location}
                onChange={update("shelf_location")}
              />
              <TextField
                label={t("copies")}
                type="number"
                fullWidth
                value={form.total_copies}
                onChange={update("total_copies")}
              />
            </Stack>

            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              {t("upload_file")}
              <input
                hidden
                type="file"
                accept=".pdf,.epub,.doc,.docx"
                onChange={(event) => setFile(event.target.files[0] || null)}
              />
            </Button>
            {file && <Typography variant="caption">{file.name}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? t("loading") : t("save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
