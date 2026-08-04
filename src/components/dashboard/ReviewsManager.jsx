"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";
import { CardActions, FieldError } from "@/components/dashboard/DashboardFormUi";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import {
  useAdminClientReviews,
  useCreateClientReview,
  useDeleteClientReview,
  useUpdateClientReview,
} from "@/hooks/useClientReviews";

const emptyValues = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  sort_order: "0",
  active: true,
};

function ReviewFormModal({ open, onClose, review }) {
  const { mutate: createReview, isPending: isCreating } = useCreateClientReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateClientReview();
  const isEditing = Boolean(review);
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  const [submitError, setSubmitError] = useState("");
  const ratingValue = watch("rating");
  const activeValue = watch("active");

  useEffect(() => {
    if (!open) return;

    if (review) {
      reset({
        name: review.name || "",
        location: review.location || "",
        quote: review.quote || "",
        rating: review.rating ?? 5,
        sort_order: String(review.sort_order ?? 0),
        active: review.active !== false,
      });
    } else {
      reset(emptyValues);
    }
    setSubmitError("");
  }, [open, review, reset]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(values) {
    setSubmitError("");
    const payload = {
      name: values.name.trim(),
      location: values.location.trim(),
      quote: values.quote.trim(),
      rating: Number(values.rating) || 5,
      sort_order: Number(values.sort_order) || 0,
      active: values.active !== false,
    };

    const onDone = {
      onSuccess: () => handleClose(),
      onError: (error) => setSubmitError(error.message || "Something went wrong."),
    };

    if (isEditing) {
      updateReview({ id: review._id, payload }, onDone);
    } else {
      createReview(payload, onDone);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography component="span" variant="h6" fontWeight={700}>
          {isEditing ? "Edit Review" : "New Review"}
        </Typography>
        <IconButton aria-label="Close" onClick={handleClose} size="small" disabled={isPending}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.25} component="form" id="client-review-form" onSubmit={handleSubmit(onSubmit)}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <Box>
            <TextField
              label="Client name"
              fullWidth
              {...register("name", { required: "Name is required" })}
              error={Boolean(errors.name)}
            />
            <FieldError message={errors.name?.message} />
          </Box>

          <TextField label="Location (optional)" fullWidth placeholder="Dhaka" {...register("location")} />

          <Box>
            <TextField
              label="Review"
              fullWidth
              multiline
              minRows={3}
              {...register("quote", { required: "Review text is required" })}
              error={Boolean(errors.quote)}
            />
            <FieldError message={errors.quote?.message} />
          </Box>

          <Stack spacing={0.75}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Rating
            </Typography>
            <Rating
              name="review-rating"
              value={Number(ratingValue) || 0}
              onChange={(_, value) => setValue("rating", value || 5)}
            />
          </Stack>

          <TextField
            label="Sort order"
            type="number"
            fullWidth
            {...register("sort_order")}
            helperText="Lower numbers appear first on the homepage."
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(activeValue)}
                onChange={(event) => setValue("active", event.target.checked)}
              />
            }
            label="Show on homepage"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" form="client-review-form" variant="contained" disabled={isPending}>
          {isPending ? <CircularProgress size={18} color="inherit" /> : isEditing ? "Save changes" : "Add review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ReviewsManager() {
  const { data: reviews = [], isLoading, isError, error, refetch } = useAdminClientReviews();
  const { mutate: deleteReview, isPending: isDeleting, variables: deletingId } = useDeleteClientReview();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  function handleDelete(review) {
    if (!window.confirm(`Delete review from "${review.name}"?`)) return;
    deleteReview(review._id);
  }

  function openCreate() {
    setEditingReview(null);
    setModalOpen(true);
  }

  function openEdit(review) {
    setEditingReview(review);
    setModalOpen(true);
  }

  return (
    <Stack spacing={3}>
      <DashPageHeader
        eyebrow="Content"
        title="Client Reviews"
        description="Add customer testimonials that appear on the homepage under Why choose us."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            Add Review
          </Button>
        }
      />

      {isLoading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 240,
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
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}>
          <Typography variant="body2" color="error">
            {error?.message || "Failed to load reviews."}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
            Try again
          </Button>
        </Paper>
      ) : reviews.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 240,
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
          <ReviewsOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 360 }}>
            Add your first client testimonial to show on the homepage.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate} sx={{ mt: 2.5 }}>
            Add Review
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            {reviews.map((review) => (
              <Box key={review._id} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700}>{review.name}</Typography>
                    {review.location ? (
                      <Typography variant="caption" color="text.secondary">
                        {review.location}
                      </Typography>
                    ) : null}
                  </Box>
                  <Chip
                    size="small"
                    label={review.active ? "Visible" : "Hidden"}
                    color={review.active ? "success" : "default"}
                    variant={review.active ? "filled" : "outlined"}
                  />
                </Stack>
                <Rating value={review.rating} readOnly size="small" sx={{ mt: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {review.quote}
                </Typography>
                <CardActions
                  onEdit={() => openEdit(review)}
                  onDelete={() => handleDelete(review)}
                  isDeleting={isDeleting && deletingId === review._id}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review._id} hover>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Typography fontWeight={600}>{review.name}</Typography>
                      {review.location ? (
                        <Typography variant="caption" color="text.secondary">
                          {review.location}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {review.quote}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>{review.sort_order}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={review.active ? "Visible" : "Hidden"}
                        color={review.active ? "success" : "default"}
                        variant={review.active ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="Edit review" size="small" onClick={() => openEdit(review)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="Delete review"
                        size="small"
                        color="error"
                        disabled={isDeleting && deletingId === review._id}
                        onClick={() => handleDelete(review)}
                      >
                        {isDeleting && deletingId === review._id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      <ReviewFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReview(null);
        }}
        review={editingReview}
      />
    </Stack>
  );
}
