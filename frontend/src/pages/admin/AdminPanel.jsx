import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  deleteResource,
  fetchAdminStats,
  fetchAllLoans,
  fetchResources,
  fetchUsers,
  returnLoan,
  updateUserRole,
} from "../../api/library";
import { apiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import ResourceFormDialog from "../../components/admin/ResourceFormDialog";

const ROLES = ["student", "instructor", "librarian", "admin"];

function StatCard({ label, value }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" fontWeight={700} color="primary">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminPanel() {
  const { t, localized, formatDate } = useI18n();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({ open: false, resource: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(() => {
    fetchAdminStats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(apiError(err)));
  }, []);

  const loadResources = useCallback(() => {
    setLoading(true);
    fetchResources({ q: search, per_page: 60, sort: "newest" })
      .then(({ data }) => setResources(data.resources))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [search]);

  const loadLoans = useCallback(() => {
    fetchAllLoans()
      .then(({ data }) => setLoans(data.loans))
      .catch((err) => setError(apiError(err)));
  }, []);

  const loadUsers = useCallback(() => {
    if (!isAdmin) return;
    fetchUsers()
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(apiError(err)));
  }, [isAdmin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (tab === 1) loadResources();
    if (tab === 2) loadLoans();
    if (tab === 3) loadUsers();
  }, [tab, loadResources, loadLoans, loadUsers]);

  const remove = async (id) => {
    setError("");
    try {
      await deleteResource(id);
      loadResources();
      loadStats();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const markReturned = async (id) => {
    setError("");
    try {
      await returnLoan(id);
      loadLoans();
      loadStats();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const changeRole = async (id, role) => {
    setError("");
    try {
      await updateUserRole(id, role);
      loadUsers();
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t("nav_admin")}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Tabs value={tab} onChange={(_event, next) => setTab(next)} variant="scrollable">
        <Tab label={t("admin_overview")} />
        <Tab label={t("admin_resources")} />
        <Tab label={t("admin_loans")} />
        {isAdmin && <Tab label={t("admin_users")} />}
      </Tabs>

      {tab === 0 && stats && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <StatCard label={t("stat_resources")} value={stats.totals.resources} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label={t("admin_active_loans")}
                value={stats.totals.active_loans}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard label={t("admin_overdue")} value={stats.totals.overdue_loans} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                label={t("admin_users_count")}
                value={stats.totals.users}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("by_type")}
                </Typography>
                {stats.by_type.map((row) => (
                  <Box key={row.resource_type} sx={{ mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {t(`type_${row.resource_type}`)}
                      </Typography>
                      <Typography variant="body2">{row.count}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(row.count / stats.totals.resources) * 100}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("by_college")}
                </Typography>
                {stats.by_college.map((row) => (
                  <Stack
                    key={row.college}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2">{row.college}</Typography>
                    <Chip size="small" label={row.count} />
                  </Stack>
                ))}
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary">
            {t("admin_fines")}: {Number(stats.totals.collected_fines).toFixed(2)}{" "}
            {t("birr")}
          </Typography>
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              fullWidth
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialog({ open: true, resource: null })}
            >
              {t("add_resource")}
            </Button>
          </Stack>
          {loading && <LinearProgress />}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>{t("author")}</TableCell>
                  <TableCell>{t("filter_type")}</TableCell>
                  <TableCell>{t("department")}</TableCell>
                  <TableCell>{t("copies")}</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{localized(resource, "title")}</TableCell>
                    <TableCell>{resource.author}</TableCell>
                    <TableCell>{t(`type_${resource.resource_type}`)}</TableCell>
                    <TableCell>{localized(resource, "department_name")}</TableCell>
                    <TableCell>
                      {resource.available_copies}/{resource.total_copies}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => setDialog({ open: true, resource })}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(resource.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      {tab === 2 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("admin_users")}</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>{t("due_on")}</TableCell>
                <TableCell>{t("fine")}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    {loan.borrower_name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {loan.borrower_university_id}
                    </Typography>
                  </TableCell>
                  <TableCell>{loan.title}</TableCell>
                  <TableCell>
                    {formatDate(loan.due_at)}
                    <Chip
                      size="small"
                      sx={{ ml: 1 }}
                      label={t(`status_${loan.status}`)}
                      color={
                        loan.status === "overdue"
                          ? "error"
                          : loan.status === "active"
                            ? "primary"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {Number(loan.fine_amount) > 0
                      ? `${Number(loan.fine_amount).toFixed(2)} ${t("birr")}`
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {!loan.returned_at && (
                      <Button size="small" onClick={() => markReturned(loan.id)}>
                        {t("mark_returned")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 3 && isAdmin && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("full_name")}</TableCell>
                <TableCell>{t("email")}</TableCell>
                <TableCell>{t("university_id")}</TableCell>
                <TableCell>{t("department")}</TableCell>
                <TableCell>{t("admin_active_loans")}</TableCell>
                <TableCell>{t("role")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.university_id}</TableCell>
                  <TableCell>{user.department_name}</TableCell>
                  <TableCell>{user.active_loans}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(event) => changeRole(user.id, event.target.value)}
                      sx={{ minWidth: 140 }}
                    >
                      {ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {t(`role_${role}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ResourceFormDialog
        open={dialog.open}
        resource={dialog.resource}
        onClose={() => setDialog({ open: false, resource: null })}
        onSaved={() => {
          setDialog({ open: false, resource: null });
          loadResources();
          loadStats();
        }}
      />
    </Stack>
  );
}
