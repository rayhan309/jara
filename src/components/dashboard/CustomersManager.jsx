"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useAdminCustomers } from "@/hooks/useDashboard";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatCustomerSpent } from "@/lib/customerHelpers";
import { formatRelativeTime } from "@/lib/dashboardStats";
import {
  formatDisplayOrderNumber,
  formatOrderDate,
  formatOrderTotal,
} from "@/lib/orderHelpers";

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ mt: 1, letterSpacing: "-0.02em" }}>
            {value}
          </Typography>
          {hint ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
        {Icon ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.50",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

function CustomerAvatar({ name }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        fontSize: 13,
        fontWeight: 700,
        bgcolor: "grey.700",
      }}
    >
      {initial}
    </Avatar>
  );
}

function CustomerViewModal({ open, customer, onClose }) {
  if (!customer) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 1 }}>
        <CustomerAvatar name={customer.name} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {customer.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customer.phone}
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            }}
          >
            <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: "divider", bgcolor: "grey.50" }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Orders
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                {customer.orderCount}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: "primary.100", bgcolor: "primary.50" }}>
              <Typography variant="caption" fontWeight={700} color="primary" sx={{ textTransform: "uppercase" }}>
                Total spent
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.dark" sx={{ mt: 0.5 }}>
                {formatCustomerSpent(customer.totalSpent)}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: "divider", bgcolor: "grey.50" }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                Last order
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                {formatRelativeTime(customer.lastOrderAt)}
              </Typography>
            </Paper>
          </Box>

          <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: "divider" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
              Address
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
              {customer.address}
            </Typography>
            <Button
              component={Link}
              href={`/orders-traking?phone=${encodeURIComponent(customer.phone)}`}
              target="_blank"
              size="small"
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ mt: 1.5, px: 0 }}
            >
              Track orders
            </Button>
          </Paper>

          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                display: "block",
                pb: 1,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              Order history
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {customer.orders.map((order) => (
                <Paper
                  key={order._id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} color="primary">
                      #{formatDisplayOrderNumber(order.order_number)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatOrderDate(order.createdAt)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusBadge status={order.status} />
                    <Typography variant="body2" fontWeight={700}>
                      {formatOrderTotal(order)}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function CustomerRowActions({ customer, onView }) {
  return (
    <IconButton
      aria-label="View customer"
      title="View"
      size="small"
      onClick={() => onView(customer)}
    >
      <VisibilityOutlinedIcon fontSize="small" />
    </IconButton>
  );
}

function MobileRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function CustomersManager() {
  const { data, isLoading, isError, error, refetch } = useAdminCustomers();
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState(null);

  const customers = data?.customers ?? [];
  const stats = data?.stats ?? { totalCustomers: 0, repeatCustomers: 0, totalSpent: 0 };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(term) ||
        customer.phone?.includes(term) ||
        customer.address?.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredCustomers);

  return (
    <Stack spacing={3}>
      <DashPageHeader
        eyebrow="CRM"
        title="Customer Directory"
        description="Customer profiles and purchase history from live orders."
        action={
          <Chip label={`${customers.length} customers`} variant="outlined" size="small" />
        }
      />

      {!isLoading && !isError && customers.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          <StatCard label="Total customers" value={stats.totalCustomers} icon={PeopleAltOutlinedIcon} />
          <StatCard
            label="Repeat customers"
            value={stats.repeatCustomers}
            hint="More than one order"
            icon={RepeatRoundedIcon}
          />
          <StatCard
            label="Lifetime value"
            value={formatCustomerSpent(stats.totalSpent)}
            icon={AccountBalanceWalletOutlinedIcon}
          />
        </Box>
      ) : null}

      {customers.length > 0 ? (
        <TextField
          fullWidth
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, or address..."
        />
      ) : null}

      {isLoading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 1,
            borderColor: "divider",
          }}
        >
          <CircularProgress size={28} />
        </Paper>
      ) : isError ? (
        <Paper
          elevation={0}
          sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}
        >
          <Typography variant="body2" color="error">
            {error?.message || "Failed to load customers."}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
            Try again
          </Button>
        </Paper>
      ) : filteredCustomers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 5,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
          }}
        >
          <PeopleAltOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {customers.length === 0 ? "No customers yet" : "No matching customers"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {customers.length === 0
              ? "Customers will appear here after their first order."
              : "Try a different search term."}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, sm: 2.5 },
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {filteredCustomers.length === customers.length
                ? `${customers.length} total customers`
                : `${filteredCustomers.length} of ${customers.length} customers`}
            </Typography>
            {stats.repeatCustomers > 0 ? (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                icon={<TrendingUpRoundedIcon />}
                label={`${stats.repeatCustomers} repeat`}
              />
            ) : null}
          </Stack>

          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            {paginatedItems.map((customer) => (
              <Box key={customer.id} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <CustomerAvatar name={customer.name} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700}>{customer.name}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {customer.phone}
                        </Typography>
                      </Box>
                      {customer.orderCount > 1 ? (
                        <Chip size="small" color="success" label="Repeat" />
                      ) : null}
                    </Stack>
                  </Box>
                </Stack>
                <Stack spacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <MobileRow label="Orders" value={customer.orderCount} />
                  <MobileRow label="Total spent" value={formatCustomerSpent(customer.totalSpent)} />
                  <MobileRow label="Last order" value={formatRelativeTime(customer.lastOrderAt)} />
                  <MobileRow label="Address" value={customer.address} />
                </Stack>
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                  <CustomerRowActions customer={customer} onView={setViewCustomer} />
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total spent</TableCell>
                  <TableCell>Last order</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CustomerAvatar name={customer.name} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {customer.name}
                          </Typography>
                          {customer.orderCount > 1 ? (
                            <Chip size="small" color="success" label="Repeat customer" sx={{ mt: 0.5, height: 20 }} />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              New customer
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {customer.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={customer.orderCount} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatCustomerSpent(customer.totalSpent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {formatRelativeTime(customer.lastOrderAt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {customer.address}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <CustomerRowActions customer={customer} onView={setViewCustomer} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Paper>
      )}

      <CustomerViewModal
        open={Boolean(viewCustomer)}
        customer={viewCustomer}
        onClose={() => setViewCustomer(null)}
      />
    </Stack>
  );
}
