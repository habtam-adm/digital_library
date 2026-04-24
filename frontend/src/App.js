import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "./layout/Layout";

// Auth Pages
import Login from "./User_Authentication/Login";
import Signup from "./User_Authentication/Sign_up";
import ForgotPassword from "./User_Authentication/Forgot_Password";
import EmailVerification from "./User_Authentication/Email_Verification";

// Pages
import Dashboard from "./User_Authentication/Dashboard";
import BookList from "./User/bookList";
import BookDetails from "./User/BookDetails";
import Colleges from "./User/Colleges";
import Departments from "./User/Departments";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* MAIN APP */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/books" element={<BookList />} />
            <Route path="books/:id" element={<BookDetails />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
