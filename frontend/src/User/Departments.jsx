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
import "../styles/user.css";

export default function Departments() {
  const departments = [
    "Software Engineering",
    "Computer Science",
    "Artificial Intelligence",
  ];

  return (
    <Container maxWidth="sm" className="page-container">
      <Typography variant="h4" className="page-title">
        Departments
      </Typography>

      <List>
        {departments.map((dept, index) => (
          <ListItem key={index} className="list-item" disablePadding>
            <ListItemButton component={Link} to="/books">
              <ListItemText primary={dept} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
