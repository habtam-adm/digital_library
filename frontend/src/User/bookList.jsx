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

export default function BookList() {
  const books = [
    { id: 1, title: "React Basics" },
    { id: 2, title: "Node.js Guide" },
    { id: 3, title: "Database Systems" },
  ];

  return (
    <Container maxWidth="sm" className="page-container">
      <Typography variant="h4" className="page-title">
        Books
      </Typography>

      <List>
        {books.map((book) => (
          <ListItem key={book.id} className="list-item" disablePadding>
            <ListItemButton component={Link} to={`/book/${book.id}`}>
              <ListItemText primary={book.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
