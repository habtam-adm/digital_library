import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchColleges, fetchDepartments, fetchResources } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";
import ResourceCard from "../components/ResourceCard";

const TYPES = ["book", "thesis", "journal", "module", "exam", "reference"];
const LANGUAGES = ["en", "am", "or", "ti", "other"];
const SORTS = ["newest", "oldest", "title", "author", "popular", "year"];

export default function Catalog() {
  const { t, localized } = useI18n();
  const [params, setParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState(params.get("q") || "");

  const filters = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const setFilter = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (value === "" || value === null || value === false) next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page");
      setParams(next);
    },
    [params, setParams],
  );

  useEffect(() => {
    fetchColleges().then(({ data }) => setColleges(data.colleges)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDepartments(filters.college_id)
      .then(({ data }) => setDepartments(data.departments))
      .catch(() => {});
  }, [filters.college_id]);

  useEffect(() => {
    setLoading(true);
    fetchResources(filters)
      .then(({ data }) => {
        setResources(data.resources);
        setPagination(data.pagination);
        setError("");
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("filters")}
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              size="small"
              label={t("filter_type")}
              value={filters.type || ""}
              onChange={(event) => setFilter("type", event.target.value)}
            >
              <MenuItem value="">-</MenuItem>
              {TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`type_${type}`)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label={t("filter_language")}
              value={filters.language || ""}
              onChange={(event) => setFilter("language", event.target.value)}
            >
              <MenuItem value="">-</MenuItem>
              {LANGUAGES.map((code) => (
                <MenuItem key={code} value={code}>
                  {t(`lang_${code}`)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label={t("filter_college")}
              value={filters.college_id || ""}
              onChange={(event) => setFilter("college_id", event.target.value)}
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
              size="small"
              label={t("filter_department")}
              value={filters.department_id || ""}
              onChange={(event) => setFilter("department_id", event.target.value)}
            >
              <MenuItem value="">-</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {localized(department, "name")}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                type="number"
                label={t("filter_year_from")}
                value={filters.year_from || ""}
                onChange={(event) => setFilter("year_from", event.target.value)}
              />
              <TextField
                size="small"
                type="number"
                label={t("filter_year_to")}
                value={filters.year_to || ""}
                onChange={(event) => setFilter("year_to", event.target.value)}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.available === "true"}
                  onChange={(event) =>
                    setFilter("available", event.target.checked ? "true" : "")
                  }
                />
              }
              label={t("filter_available_only")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.digital === "true"}
                  onChange={(event) =>
                    setFilter("digital", event.target.checked ? "true" : "")
                  }
                />
              }
              label={t("filter_digital_only")}
            />

            <Button
              onClick={() => {
                setTerm("");
                setParams(new URLSearchParams());
              }}
            >
              {t("filter_clear")}
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={9}>
        <Stack spacing={2}>
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              setFilter("q", term);
            }}
            sx={{ display: "flex", gap: 1 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={t("search_placeholder")}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
            <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
              {t("search_button")}
            </Button>
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t("results_count", { count: pagination.total })}
            </Typography>
            <TextField
              select
              size="small"
              label={t("sort_by")}
              value={filters.sort || "newest"}
              onChange={(event) => setFilter("sort", event.target.value)}
              sx={{ minWidth: 180 }}
            >
              {SORTS.map((sort) => (
                <MenuItem key={sort} value={sort}>
                  {t(`sort_${sort}`)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : resources.length === 0 ? (
            <Alert severity="info">{t("no_results")}</Alert>
          ) : (
            <Grid container spacing={2}>
              {resources.map((resource) => (
                <Grid item xs={12} sm={6} lg={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          )}

          {pagination.pages > 1 && (
            <Stack alignItems="center">
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(_event, page) => setFilter("page", page)}
                color="primary"
              />
            </Stack>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
