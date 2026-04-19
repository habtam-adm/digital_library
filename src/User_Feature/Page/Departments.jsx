import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colleges, departments } from "../Data/Data";
import { Box, Container, Typography, Card, CardContent } from "@mui/material";



const Department = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const collegeId = Number(id);

  const college = colleges.find((c) => c.id === collegeId);

  const filteredDepartments = departments.filter(
    (d) => d.collegeId === collegeId
  );

  if (!college) {
    return (
      <Box sx={{ minHeight: "60vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container sx={{ bgcolor: "#fff", borderRadius: 3, p: 3 }}>
          <Typography variant="h5">College not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "flex-start", pt: 4, pb: 4 }}>
      <Container maxWidth="sm" sx={{ bgcolor: "#fff", borderRadius: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          {college.name}
        </Typography>

        <Typography variant="h5" gutterBottom align="center">
          Departments
        </Typography>

        {filteredDepartments.map((dept) => (
          <Card
            key={dept.id}
            sx={{ mb: 2, cursor: "pointer", transition: "0.2s", '&:hover': { boxShadow: 6 } }}
            onClick={() => navigate(`/department/${dept.id}`)}
          >
            <CardContent>
              <Typography align="center" variant="h6">
                {dept.name}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
};

export default Department;