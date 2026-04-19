import React from "react";
import { colleges } from "../Data/Data";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";

const CollegeList = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        pt: 6,
        pb: 4
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 1,
          fontWeight: 700,
          fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
          lineHeight: 1.05,
          textAlign: "center",
          background: "linear-gradient(90deg,#2b5876 0%,#4e8fb1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 6px 18px rgba(46,60,80,0.08)"
        }}
      >
        WELCOME TO DIGITAL LIBRARY
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2, color: "rgba(0,0,0,0.6)", textAlign: "center" }}>
        Explore colleges, departments and curated books — find what inspires you.
      </Typography>

  <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            p: 4,
            bgcolor: "#fff",
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