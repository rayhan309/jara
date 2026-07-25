"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
      {message}
    </Typography>
  );
}

export function CardActions({ onEdit, onDelete, isDeleting, editLabel = "Edit", deleteLabel = "Delete" }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
      <Button variant="outlined" color="primary" onClick={onEdit} fullWidth>
        {editLabel}
      </Button>
      <Button variant="outlined" color="error" onClick={onDelete} disabled={isDeleting} fullWidth>
        {isDeleting ? "Deleting..." : deleteLabel}
      </Button>
    </Stack>
  );
}
