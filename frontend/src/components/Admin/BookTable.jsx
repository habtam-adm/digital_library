import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { deleteBook } from "../../api/bookApi";

export default function BookTable({ books, onRefresh, onEditClick }) {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(id);
        onRefresh();
      } catch (err) {
        alert("can not delete");
      }
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
          <TableRow>
            <TableCell>Cover</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>College</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book._id} hover>
              <TableCell>
                <Avatar src={book.imageUrl} alt={book.title} variant="rounded" sx={{ width: 40, height: 50 }} />
              </TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.college}</TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => onEditClick(book)}><Edit /></IconButton>
                <IconButton color="error" onClick={() => handleDelete(book._id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}