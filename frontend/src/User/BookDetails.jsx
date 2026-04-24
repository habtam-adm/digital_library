import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import "../styles/user.css";

export default function BookDetails() {
  const { id } = useParams();

  const books = {
    1: { title: "React Basics", description: "Learn React fundamentals." },
    2: {
      title: "Node.js Guide",
      description: "Backend development with Node.",
    },
    3: { title: "Database Systems", description: "Learn SQL and databases." },
  };

  const book = books[id];

  if (!book) {
    return (
      <Container className="page-container">
        <Typography variant="h5">Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" className="page-container">
      <Box className="book-card">
        <Typography variant="h4" gutterBottom>
          {book.title}
        </Typography>

        <Typography variant="body1">{book.description}</Typography>

        <Button
          variant="contained"
          component={Link}
          to="/books"
          className="btn-primary"
        >
          Back to Books
        </Button>
      </Box>
    </Container>
  );
}
