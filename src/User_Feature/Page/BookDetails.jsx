import React from "react";
import { useParams } from "react-router-dom";
import { books } from "../Data/Data";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";

const BookDetails = () => {
  const { bookId } = useParams();  

  const book = books.find((b) => b.id === Number(bookId));

  if (!book) {
    return (
      <Box sx={{ minHeight: "60vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container sx={{ bgcolor: "#fff", borderRadius: 3, p: 3 }}>
          <Typography variant="h5">Book not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "flex-start", pt: 4, pb: 4 }}>
      <Container maxWidth="md" sx={{ bgcolor: "#fff", borderRadius: 3, p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>

            <Typography variant="h6">Author: {book.author}</Typography>

            <Typography sx={{ mt: 2 }}>{book.description}</Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BookDetails;