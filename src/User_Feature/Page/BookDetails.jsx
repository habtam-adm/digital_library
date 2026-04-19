import React from "react";
import { useParams } from "react-router-dom";
import { books } from "../Data/Data";
import { Container, Typography, Card, CardContent } from "@mui/material";

const BookDetails = () => {
  const { bookId } = useParams();  

  const book = books.find((b) => b.id === Number(bookId));

  if (!book) {
    return (
      <Container>
        <Typography variant="h5">Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {book.title}
          </Typography>

          <Typography variant="h6">
            Author: {book.author}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            {book.description}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BookDetails;