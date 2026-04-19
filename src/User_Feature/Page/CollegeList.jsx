import React from "react";
import { colleges } from "../Data/Data";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box
} from "@mui/material";

const CollegeList = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#aeeef4ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column" 
      }}
    >
      
      <Typography
        variant="h3"
        sx={{ mb: 3, fontWeight: "bold" }}
        align="center"
      >
            WELCOME TO DIGITAL LIBRARY
      </Typography>

    
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: 4
          }}
        >
          {colleges.map((college) => (
            <Card
              key={college.id}
              sx={{
                mb: 2,
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { boxShadow: 6 }
              }}
              onClick={() => navigate(`/college/${college.id}`)}
            >
              <CardContent>
                <Typography align="center" variant="h6">
                  {college.name}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default CollegeList;