import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colleges, departments } from "../Data/Data";
import { Container, Typography, Card, CardContent } from "@mui/material";



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
      <Container>
        <Typography variant="h5">College not found</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {college.name}
      </Typography>

      <Typography variant="h5" gutterBottom align="center">
        Departments
      </Typography>

      {filteredDepartments.map((dept) => (
        <Card
          key={dept.id}
          sx={{ mb: 2, cursor: "pointer" }}
     onClick={() => navigate(`/department/${dept.id}`)}
        >
          <CardContent>
            <Typography align="center" variant="h6">{dept.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default Department;