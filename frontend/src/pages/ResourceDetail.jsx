import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { borrowResource, fetchResource, returnLoan } from "../api/library";
import { apiError, fileUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import ResourceCard from "../components/ResourceCard";

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, localized, formatDate } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchResource(id)
      .then((response) => setData(response.data))
      .catch((err) => setError(apiError(err)));
  }, [id]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const borrow = async () => {
    setBusy(true);
    setError("");
    try {
      await borrowResource(Number(id));
      setMessage(t("borrow_success"));
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const giveBack = async () => {
    setBusy(true);
    setError("");
    try {
      await returnLoan(data.active_loan.id);
      setMessage(t("return_success"));
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { resource, related, active_loan: activeLoan } = data;
  const rows = [
    [t("author"), resource.author],
    [t("publisher"), resource.publisher],
    [
      t("published"),
      resource.publication_year
        ? `${resource.publication_year}${
            resource.publication_year_ec ? ` (${resource.publication_year_ec} E.C.)` : ""
          }`
        : "",
    ],
    [t("isbn"), resource.isbn],
    [t("subject"), resource.subject],
    [t("keywords"), resource.keywords],
    [t("edition"), resource.edition],
    [t("pages"), resource.pages],
    [t("college"), localized(resource, "college_name")],
    [t("department"), localized(resource, "department_name")],
    [t("shelf"), resource.shelf_location],
    [
      t("copies"),
      resource.total_copies > 0
        ? `${resource.available_copies}/${resource.total_copies}`
        : "",
    ],
    [t("downloads"), resource.download_count],
    [t("views"), resource.view_count],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
          <Chip label={t(`type_${resource.resource_type}`)} color="primary" />
          <Chip label={t(`lang_${resource.language}`)} variant="outlined" />
          {resource.total_copies > 0 && (
            <Chip
              label={
                resource.available_copies > 0
                  ? `${t("available")}: ${resource.available_copies}`
                  : t("unavailable")
              }
              color={resource.available_copies > 0 ? "success" : "error"}
              variant="outlined"
            />
          )}
        </Stack>

        <Typography variant="h5" fontWeight={700}>
          {localized(resource, "title")}
        </Typography>
        {resource.title_am && resource.title_am !== resource.title && (
          <Typography variant="subtitle1" color="text.secondary">
            {resource.title_am}
          </Typography>
        )}
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {resource.author}
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
          {resource.file_path && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              href={fileUrl(resource.id)}
              target="_blank"
              rel="noreferrer"
            >
              {t("download")}
            </Button>
          )}
          {!user && resource.total_copies > 0 && (
            <Button component={RouterLink} to="/login" variant="outlined">
              {t("login_to_borrow")}
            </Button>
          )}
          {user && activeLoan && (
            <Button variant="outlined" color="warning" disabled={busy} onClick={giveBack}>
              {t("return_item")}
            </Button>
          )}
          {user && !activeLoan && resource.total_copies > 0 && (
            <Button
              variant="outlined"
              disabled={busy || resource.available_copies < 1}
              onClick={borrow}
            >
              {t("borrow")}
            </Button>
          )}
        </Stack>

        {activeLoan && (
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            {t("due_on")}: {formatDate(activeLoan.due_at)}
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={resource.file_path ? 5 : 12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {resource.abstract && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t("abstract")}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {resource.abstract}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </>
            )}
            <Table size="small">
              <TableBody>
                {rows.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell sx={{ fontWeight: 600, width: "40%" }}>{label}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {resource.file_path && (
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 1, height: "100%" }}>
              <Typography variant="h6" sx={{ px: 1, pb: 1 }}>
                {t("read_online")}
              </Typography>
              <Box
                component="iframe"
                title={resource.title}
                src={fileUrl(resource.id)}
                sx={{ width: "100%", height: 620, border: 0 }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {related.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t("related")}
          </Typography>
          <Grid container spacing={2}>
            {related.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <ResourceCard resource={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  );
}
