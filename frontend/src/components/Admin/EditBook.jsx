import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import { updateBook } from "../../api/bookApi";

export default function EditBook({ open, onClose, book, onRefresh }) {
  const [form, setForm] = useState({ title: "", author: "", college: "", imageUrl: "" });

  useEffect(() => {
    if (book) setForm(book);
  }, [book]);

  const handleUpdate = async () => {
    try {
      await updateBook(book._id, form);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Unable to update");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Book Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
          <TextField label="Author" fullWidth value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} />
          <TextField label="College" fullWidth value={form.college} onChange={(e) => setForm({...form, college: e.target.value})} />
          <TextField label="Image URL" fullWidth value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
      </DialogActions>
    </Dialog>
  );
}