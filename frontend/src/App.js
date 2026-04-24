import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";

import { AuthProvider } from "./context/AuthContext";

// Auth Pages
import LoginUI from './User_Authentication/Login';
import Signup from './User_Authentication/Sign_up';
import ForgotPassword from './User_Authentication/Forgot_Password';
import EmailVerification from './User_Authentication/Email_Verification';

// Admin
import AdminPanel from './pages/Admin/AdminPanel';

// User Pages
import Dashboard from "./User_Authentication/Dashboard";
import BookList from "./User/bookList";
import BookDetails from "./User/BookDetails";
import Colleges from "./User/Colleges";
import Departments from "./User/Departments";

// (⚠️ make sure you actually have this file)
import Layout from "./components/Layout";

const defaultTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Router>
          <Routes>

            {/* AUTH */}
            <Route path="/" element={<LoginUI />} />
            <Route path="/login" element={<LoginUI />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* MAIN APP */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/colleges" element={<Colleges />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetails />} />
            </Route>

          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;