import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { books } from "../Data/Data";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid
} from "@mui/material";

const BookList = () => {
 
  const { id } = useParams();
const deptId = Number(id);
const navigate = useNavigate(); 

  const filteredBooks = books.filter(
    (book) => book.departmentId === deptId
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 4,
        pb: 4
      }}
    >
      <Container maxWidth="md" sx={{ bgcolor: "#fff", borderRadius: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }} align="center">
          Books
        </Typography>

        {filteredBooks.length === 0 ? (
          <Typography align="center">No books found for this department.</Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} md={6} key={book.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6">{book.title}</Typography>

                    <Typography variant="body2">Author: {book.author}</Typography>

                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default BookList;