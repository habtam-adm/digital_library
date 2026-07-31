import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useI18n } from "../context/I18nContext";

export default function ResourceCard({ resource }) {
  const { t, localized } = useI18n();
  const available = resource.available_copies > 0;

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        component={RouterLink}
        to={`/resources/${resource.id}`}
        sx={{ height: "100%", alignItems: "flex-start" }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              icon={<MenuBookIcon />}
              label={t(`type_${resource.resource_type}`)}
              color="primary"
              variant="outlined"
            />
            {resource.file_path && (
              <Chip
                size="small"
                icon={<PictureAsPdfIcon />}
                label={t("read_online")}
                color="success"
                variant="outlined"
              />
            )}
          </Stack>

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {localized(resource, "title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {resource.author}
          </Typography>
          {resource.publication_year && (
            <Typography variant="body2" color="text.secondary">
              {resource.publisher ? `${resource.publisher}, ` : ""}
              {resource.publication_year}
              {resource.publication_year_ec
                ? ` (${resource.publication_year_ec} E.C.)`
                : ""}
            </Typography>
          )}
          {resource.department_name && (
            <Typography variant="caption" color="text.secondary">
              {localized(resource, "department_name")}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{ mt: 1 }}
            color={available ? "success.main" : "error.main"}
          >
            {resource.total_copies > 0
              ? `${t("available")}: ${resource.available_copies}/${resource.total_copies}`
              : t("read_online")}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
