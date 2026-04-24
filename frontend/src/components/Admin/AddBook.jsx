import React, { useState } from "react";
import { Box, TextField, Button, Paper, Grid, Typography, Alert } from "@mui/material";

import { addBook } from "../../api/bookApi";

export default function AddBook({ onRefresh }) {
  const [form, setForm] = useState({ title: "", author: "", college: "", imageUrl: "" });
  const [msg, setMsg] = useState({ type: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBook(form);
      setMsg({ type: "success", content: "Book registered successfully!" });
      setForm({ title: "", author: "", college: "", imageUrl: "" });
      onRefresh(); 
    } catch (err) {
      setMsg({ type: "error", content: "Registration failed. Please try again later" });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" mb={2} fontWeight="bold">Add New Book</Typography>
      {msg.content && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.content}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Title" fullWidth size="small" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Author" fullWidth size="small" value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="College" fullWidth size="small" value={form.college} onChange={(e) => setForm({...form, college: e.target.value})} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Image URL" fullWidth size="small" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>Save Book</Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}