"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ProductsManager from "@/components/dashboard/ProductsManager";
import CategoriesManager from "@/components/dashboard/CategoriesManager";

function CatalogTabs({ activeTab, onChange }) {
  return (
    <Tabs
      value={activeTab}
      onChange={(_, value) => onChange(value)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", minHeight: 44 }}
    >
      <Tab
        value="products"
        icon={<Inventory2OutlinedIcon fontSize="small" />}
        iconPosition="start"
        label="Products"
        sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }}
      />
      <Tab
        value="categories"
        icon={<CategoryOutlinedIcon fontSize="small" />}
        iconPosition="start"
        label="Categories"
        sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }}
      />
    </Tabs>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "categories" ? "categories" : "products";

  function handleTabChange(tab) {
    router.push(
      tab === "categories" ? "/dashboard/products?tab=categories" : "/dashboard/products"
    );
  }

  return (
    <Stack spacing={3}>
      <CatalogTabs activeTab={activeTab} onChange={handleTabChange} />
      {activeTab === "categories" ? (
        <CategoriesManager embedded />
      ) : (
        <ProductsManager embedded />
      )}
    </Stack>
  );
}

function CatalogFallback() {
  return (
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
      <CircularProgress size={32} />
    </Paper>
  );
}

export default function CatalogManager() {
  return (
    <Box>
      <Suspense fallback={<CatalogFallback />}>
        <CatalogContent />
      </Suspense>
    </Box>
  );
}
