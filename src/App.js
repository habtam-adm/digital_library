import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// አራቱን ገጾች ከ User_Authentication ፎልደር ውስጥ Import እናደርጋለን
import LoginUI from './User_Authentication/Login';
import Signup from './User_Authentication/Sign_up';
import ForgotPassword from './User_Authentication/Forgot_Password';
import EmailVerification from './User_Authentication/Email_Verification';



import CollegeList from './User_Feature/Page/CollegeList.jsx';
import Department from './User_Feature/Page/Departments.jsx'; 
import BookList from './User_Feature/Page/BookList.jsx';
import BookDetails from './User_Feature/Page/BookDetails.jsx';



const defaultTheme = createTheme();


function App() {
  return (  
    <ThemeProvider theme={defaultTheme}>
      <Router>
        <Routes>

          <Route path="/" element={<LoginUI />} />
          <Route path="/login" element={<LoginUI />} />
          
        
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />

         <Route path="/" element={<CollegeList />} />
<Route path="/college/:id" element={<Department />} />
<Route path="/department/:id" element={<BookList />} />
<Route path="/book/:bookId" element={<BookDetails />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;