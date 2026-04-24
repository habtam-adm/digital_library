import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Divider, Paper } from "@mui/material";
import { getBooks } from "../../api/bookApi";

import AddBook from "../../components/Admin/AddBook.jsx";
import BookTable from "../../components/Admin/BookTable";
import EditBook from "../../components/Admin/EditBook";

export default function AdminPanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await getBooks();
      setBooks(res.data);
    } catch (err) {
      console.error("Could not retrieve data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Library Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage books here – you can register, view, edit, and delete  
      </Typography>
      </Box>

      <AddBook onRefresh={fetchBooks} />

      <Divider sx={{ my: 4 }} />

    
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
          Book Inventory ({books.length})
        </Typography>
        
        {loading ? (
          <Typography align="center">Loading data...</Typography>
        ) : (
          <BookTable 
            books={books} 
            onRefresh={fetchBooks} 
            onEditClick={handleEditClick} 
          />
        )}
      </Box>

     
      <EditBook 
        open={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        book={selectedBook} 
        onRefresh={fetchBooks} 
      />
    </Container>
  );
}