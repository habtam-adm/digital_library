import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { fetchMyLoans, returnLoan } from "../api/library";
import { apiError } from "../api/client";
import { useI18n } from "../context/I18nContext";

const STATUS_COLOR = { active: "primary", overdue: "error", returned: "default" };

export default function MyLoans() {
  const { t, formatDate } = useI18n();
  const [loans, setLoans] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetchMyLoans()
      .then(({ data }) => setLoans(data.loans))
      .catch((err) => setError(apiError(err)));
  }, []);

  useEffect(load, [load]);

  const giveBack = async (id) => {
    setError("");
    try {
      await returnLoan(id);
      setMessage(t("return_success"));
      load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  if (!loans) {
    return error ? (
      <Alert severity="error">{error}</Alert>
    ) : (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        {t("nav_my_loans")}
      </Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {loans.length === 0 ? (
        <Alert severity="info">{t("no_loans")}</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("nav_catalog")}</TableCell>
                <TableCell>{t("borrowed_on")}</TableCell>
                <TableCell>{t("due_on")}</TableCell>
                <TableCell>{t("fine")}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <RouterLink to={`/resources/${loan.resource_id}`}>
                        {loan.title}
                      </RouterLink>
                      <Typography variant="caption" color="text.secondary">
                        {loan.author}
                      </Typography>
                      <Box>
                        <Chip
                          size="small"
                          label={t(`status_${loan.status}`)}
                          color={STATUS_COLOR[loan.status]}
                        />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(loan.borrowed_at)}</TableCell>
                  <TableCell>{formatDate(loan.due_at)}</TableCell>
                  <TableCell>
                    {Number(loan.fine_amount) > 0
                      ? `${Number(loan.fine_amount).toFixed(2)} ${t("birr")}`
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {!loan.returned_at && (
                      <Button size="small" onClick={() => giveBack(loan.id)}>
                        {t("return_item")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
