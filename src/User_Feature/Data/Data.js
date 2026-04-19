export const colleges = [
  { id: 1, name: "Informatics and Computer Science College" }
];

export const departments = [
  { id: 1, collegeId: 1, name: "Software Engineering" },
  { id: 2, collegeId: 1, name: "Computer Science" },
  { id: 3, collegeId: 1, name: "Information Systems" },
  { id: 4, collegeId: 1, name: "Information Technology" }
];

export const books = [
  {
    id: 1,
    departmentId: 1,
    title: "Software Engineering Basics",
    author: "Ian Sommerville",
    description: "Introduction to software development processes"
  },
  {
    id: 2,
    departmentId: 2,
    title: "Data Structures",
    author: "Mark Allen Weiss",
    description: "Covers data structures and algorithms"
  },
  {
    id: 3,
    departmentId: 3,
    title: "Database Systems",
    author: "Elmasri",
    description: "Introduction to database design"
  },
  {
    id: 4,
    departmentId: 4,
    title: "Networking Fundamentals",
    author: "Kurose",
    description: "Basics of computer networking"
  }
];