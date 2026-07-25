"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OrdersManager from "@/components/dashboard/OrdersManager";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

export default function RepeatCustomerReport() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: 1, borderColor: "divider" }}>
        <DashPageHeader
          eyebrow="Reports"
          title="Repeat Customer Report"
          description={
            phone
              ? `Showing all orders for ${phone}.`
              : "Select a repeat customer from Orders to view the report."
          }
          animate={false}
          action={
            <Button
              component={Link}
              href="/dashboard/orders"
              startIcon={<ArrowBackRoundedIcon />}
              color="primary"
            >
              Back to Orders
            </Button>
          }
        />
      </Paper>

      <OrdersManager initialSearch={phone} reportMode />
    </Stack>
  );
}
