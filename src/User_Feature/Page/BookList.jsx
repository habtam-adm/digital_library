import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { books } from "../Data/Data";
import {
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
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Books
      </Typography>

      <Grid container spacing={2}>
        {filteredBooks.map((book) => (
          <Grid item xs={12} md={6} key={book.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {book.title}
                </Typography>

                <Typography variant="body2">
                  Author: {book.author}
                </Typography>

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
    </Container>
  );
};

export default BookList;