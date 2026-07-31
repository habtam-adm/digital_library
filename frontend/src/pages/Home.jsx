import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchOverview } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";
import ResourceCard from "../components/ResourceCard";

function StatCard({ label, value }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h4" fontWeight={700} color="primary">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverview()
      .then((response) => setData(response.data))
      .catch((err) => setError(apiError(err)));
  }, []);

  const search = (event) => {
    event.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(term)}`);
  };

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t("hero_title")}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
          {t("hero_subtitle")}
        </Typography>
        <Box component="form" onSubmit={search} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder={t("search_placeholder")}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            sx={{ bgcolor: "background.paper", borderRadius: 1 }}
          />
          <Button type="submit" variant="contained" color="secondary" startIcon={<SearchIcon />}>
            {t("search_button")}
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {data && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2.4}>
              <StatCard label={t("stat_resources")} value={data.totals.resources} />
            </Grid>
            <Grid item xs={6} md={2.4}>
              <StatCard label={t("stat_digital")} value={data.totals.digital_copies} />
            </Grid>
            <Grid item xs={6} md={2.4}>
              <StatCard label={t("stat_theses")} value={data.totals.theses} />
            </Grid>
            <Grid item xs={6} md={2.4}>
              <StatCard label={t("stat_colleges")} value={data.totals.colleges} />
            </Grid>
            <Grid item xs={6} md={2.4}>
              <StatCard label={t("stat_departments")} value={data.totals.departments} />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="h6" gutterBottom>
              {t("recently_added")}
            </Typography>
            <Grid container spacing={2}>
              {data.latest.map((resource) => (
                <Grid item xs={12} sm={6} md={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              {t("popular_now")}
            </Typography>
            <Grid container spacing={2}>
              {data.popular.map((resource) => (
                <Grid item xs={12} sm={6} md={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}
    </Stack>
  );
}
