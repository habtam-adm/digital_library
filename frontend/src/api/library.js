import client from "./client";

export const login = (payload) => client.post("/auth/login", payload);
export const signup = (payload) => client.post("/auth/signup", payload);
export const verifyEmail = (payload) => client.post("/auth/verify-email", payload);
export const requestReset = (payload) => client.post("/auth/request-reset", payload);
export const resetPassword = (payload) => client.post("/auth/reset-password", payload);
export const fetchMe = () => client.get("/auth/me");

export const fetchColleges = () => client.get("/colleges");
export const fetchDepartments = (collegeId) =>
  client.get("/departments", { params: collegeId ? { college_id: collegeId } : {} });

export const fetchResources = (params) => client.get("/resources", { params });
export const fetchResource = (id) => client.get(`/resources/${id}`);
export const fetchFacets = () => client.get("/resources/facets");

const multipart = { headers: { "Content-Type": "multipart/form-data" } };
export const createResource = (formData) =>
  client.post("/resources", formData, multipart);
export const updateResource = (id, formData) =>
  client.put(`/resources/${id}`, formData, multipart);
export const deleteResource = (id) => client.delete(`/resources/${id}`);

export const fetchMyLoans = () => client.get("/loans/mine");
export const fetchAllLoans = (status) =>
  client.get("/loans", { params: status ? { status } : {} });
export const borrowResource = (resourceId) =>
  client.post("/loans", { resource_id: resourceId });
export const returnLoan = (loanId) => client.post(`/loans/${loanId}/return`);

export const fetchOverview = () => client.get("/stats/overview");
export const fetchAdminStats = () => client.get("/stats/admin");
export const fetchUsers = () => client.get("/stats/users");
export const updateUserRole = (id, role) => client.put(`/stats/users/${id}/role`, { role });
