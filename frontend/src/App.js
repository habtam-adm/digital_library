import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";

import { AuthProvider } from "./context/AuthContext";

import LoginUI from './User_Authentication/Login';
import Signup from './User_Authentication/Sign_up';
import ForgotPassword from './User_Authentication/Forgot_Password';
import EmailVerification from './User_Authentication/Email_Verification';

import AdminPanel from './pages/Admin/AdminPanel';


const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', 
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline /> 
        <Router>
          <Routes>
            <Route path="/" element={<LoginUI />} /> 
            <Route path="/login" element={<LoginUI />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />

            <Route path="/admin" element={<AdminPanel />} />
            
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;