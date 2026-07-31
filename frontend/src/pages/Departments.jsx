import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fetchColleges, fetchDepartments } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

export default function Departments() {
  const { t, localized } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const collegeId = params.get("college_id") || "";
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchColleges().then(({ data }) => setColleges(data.colleges)).catch(() => {});
  }, []);

  useEffect(() => {
    setDepartments(null);
    fetchDepartments(collegeId)
      .then(({ data }) => setDepartments(data.departments))
      .catch((err) => setError(apiError(err)));
  }, [collegeId]);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t("nav_departments")}
        </Typography>
        <TextField
          select
          size="small"
          label={t("filter_college")}
          value={collegeId}
          onChange={(event) =>
            setParams(event.target.value ? { college_id: event.target.value } : {})
          }
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="">-</MenuItem>
          {colleges.map((college) => (
            <MenuItem key={college.id} value={college.id}>
              {localized(college, "name")}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {!departments ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {departments.map((department) => (
            <Grid item xs={12} sm={6} md={4} key={department.id}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  sx={{ height: "100%" }}
                  onClick={() => navigate(`/catalog?department_id=${department.id}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {localized(department, "name")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {localized(department, "college_name")}
                    </Typography>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${department.resource_count} ${t("stat_resources")}`}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
