"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export default function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
        px: 2,
        py: 1.5,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: "center", sm: "left" } }}>
        Showing{" "}
        <Box component="span" fontWeight={700} color="text.primary">
          {start}
        </Box>
        –
        <Box component="span" fontWeight={700} color="text.primary">
          {end}
        </Box>{" "}
        of{" "}
        <Box component="span" fontWeight={700} color="text.primary">
          {totalItems}
        </Box>
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="small"
          sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" fontWeight={700} sx={{ minWidth: 88, textAlign: "center" }}>
          Page {page} / {totalPages}
        </Typography>
        <IconButton
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          size="small"
          sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
