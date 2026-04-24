import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {user.name && (
        <Typography variant="subtitle1">Welcome, {user.name}!</Typography>
      )}
      <List sx={{ mt: 2 }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/colleges">
            <ListItemText primary="Colleges" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/departments">
            <ListItemText primary="Departments" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/books">
            <ListItemText primary="Book List" />
          </ListItemButton>
        </ListItem>
      </List>
    </Container>
  );
}
