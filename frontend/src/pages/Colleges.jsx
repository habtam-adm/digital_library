import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { fetchColleges } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

export default function Colleges() {
  const { t, localized } = useI18n();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchColleges()
      .then(({ data }) => setColleges(data.colleges))
      .catch((err) => setError(apiError(err)));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!colleges) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t("nav_colleges")}
      </Typography>
      <Grid container spacing={2}>
        {colleges.map((college) => (
          <Grid item xs={12} sm={6} md={4} key={college.id}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardActionArea
                sx={{ height: "100%" }}
                onClick={() => navigate(`/departments?college_id=${college.id}`)}
              >
                <CardContent>
                  <SchoolIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {localized(college, "name")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {college.code}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={`${college.department_count} ${t("nav_departments")}`}
                    />
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${college.resource_count} ${t("stat_resources")}`}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
