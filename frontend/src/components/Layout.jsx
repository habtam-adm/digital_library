import React, { useState } from "react";
import { Link as RouterLink, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { API_BASE } from "../api/client";

const drawerWidth = 260;

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, isStaff, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const menu = [
    { key: "nav_home", path: "/", icon: <HomeIcon /> },
    { key: "nav_catalog", path: "/catalog", icon: <SearchIcon /> },
    { key: "nav_colleges", path: "/colleges", icon: <SchoolIcon /> },
    { key: "nav_departments", path: "/departments", icon: <ApartmentIcon /> },
    ...(user ? [{ key: "nav_my_loans", path: "/my-loans", icon: <BookmarksIcon /> }] : []),
    ...(isStaff
      ? [{ key: "nav_admin", path: "/admin", icon: <AdminPanelSettingsIcon /> }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(true)}
            aria-label="menu"
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <LocalLibraryIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
          >
            {t("app_short")}
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, mr: 2 }}>
            {menu.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                color="inherit"
                sx={{ "&.active": { textDecoration: "underline" } }}
              >
                {t(item.key)}
              </Button>
            ))}
          </Box>

          <LanguageSwitcher />

          {user ? (
            <Tooltip title={`${user.full_name} (${t(`role_${user.role}`)})`}>
              <Button color="inherit" onClick={handleLogout}>
                {t("nav_logout")}
              </Button>
            </Tooltip>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              {t("nav_login")}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: drawerWidth }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t("app_name")}
            </Typography>
            {user && (
              <Typography variant="body2" color="text.secondary">
                {user.full_name} - {t(`role_${user.role}`)}
              </Typography>
            )}
          </Box>
          <Divider />
          <List>
            {menu.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={t(item.key)} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ bgcolor: "grey.100", py: 2, mt: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            {t("footer_note")}{" "}
            <a href={`${API_BASE}/oai?verb=Identify`} target="_blank" rel="noreferrer">
              {t("open_repository")}
            </a>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
