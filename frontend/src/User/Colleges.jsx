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

export default function Colleges() {
  const colleges = ["CCI", "Medical College", "Engineering"];

  return (
    <Container maxWidth="sm" className="page-container">
      <Typography variant="h4" className="page-title">
        Colleges
      </Typography>

      <List>
        {colleges.map((college, index) => (
          <ListItem key={index} className="list-item" disablePadding>
            <ListItemButton component={Link} to="/departments">
              <ListItemText primary={college} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
