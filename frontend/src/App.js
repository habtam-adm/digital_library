import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./context/I18nContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ResourceDetail from "./pages/ResourceDetail";
import Colleges from "./pages/Colleges";
import Departments from "./pages/Departments";
import MyLoans from "./pages/MyLoans";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminPanel from "./pages/admin/AdminPanel";

const theme = createTheme({
  palette: {
    primary: { main: "#0b5d3b" },
    secondary: { main: "#f2a900" },
  },
  typography: {
    fontFamily:
      '"Noto Sans Ethiopic", "Abyssinica SIL", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/departments" element={<Departments />} />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/my-loans" element={<MyLoans />} />
                </Route>
                <Route element={<ProtectedRoute roles={["librarian", "admin"]} />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
