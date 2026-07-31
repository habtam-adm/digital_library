import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useI18n } from "../context/I18nContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useI18n();

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={language}
      onChange={(_event, next) => next && changeLanguage(next)}
      sx={{
        mr: 1,
        bgcolor: "rgba(255,255,255,0.15)",
        "& .MuiToggleButton-root": { color: "inherit", border: "none", px: 1.2 },
        "& .Mui-selected": { bgcolor: "rgba(255,255,255,0.35) !important" },
      }}
    >
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="am">አማ</ToggleButton>
    </ToggleButtonGroup>
  );
}
