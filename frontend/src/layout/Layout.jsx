import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 240;

export default function Layout() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const menuItems = [
    { text: "Dashboard", path: "/dashboard" },
    { text: "Colleges", path: "/colleges" },
    { text: "Departments", path: "/departments" },
    { text: "Books", path: "/books" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Digital Library</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        open={open}
        onClose={toggleDrawer}
        sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
      >
        <Box sx={{ width: drawerWidth }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Menu
          </Typography>

          <List>
            {menuItems.map((item, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer}
                >
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Page Content */}
      <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
