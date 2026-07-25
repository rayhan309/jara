"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { CardActions, FieldError } from "@/components/dashboard/DashboardFormUi";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { slugify } from "@/lib/slugify";
import {
  useCreateProductAttribute,
  useDeleteProductAttribute,
  useProductAttributes,
  useUpdateProductAttribute,
} from "@/hooks/useProductAttributes";

const emptyValues = {
  name: "",
  name_bn: "",
  slug: "",
  placeholder: "",
  sort_order: "0",
};

function AttributeFormModal({ open, onClose, attribute }) {
  const { mutate: createAttribute, isPending: isCreating } = useCreateProductAttribute();
  const { mutate: updateAttribute, isPending: isUpdating } = useUpdateProductAttribute();
  const isEditing = Boolean(attribute);
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  const [slugEdited, setSlugEdited] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const nameValue = watch("name");

  useEffect(() => {
    if (!open) return;

    if (attribute) {
      reset({
        name: attribute.name || "",
        name_bn: attribute.name_bn || "",
        slug: attribute.slug || "",
        placeholder: attribute.placeholder || "",
        sort_order: String(attribute.sort_order ?? 0),
      });
      setSlugEdited(true);
    } else {
      reset(emptyValues);
      setSlugEdited(false);
    }
    setSubmitError("");
  }, [open, attribute, reset]);

  useEffect(() => {
    if (!open || slugEdited) return;
    setValue("slug", slugify(nameValue || ""));
  }, [nameValue, slugEdited, open, setValue]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onSubmit(values) {
    setSubmitError("");
    const payload = {
      name: values.name.trim(),
      name_bn: values.name_bn.trim() || values.name.trim(),
      slug: values.slug.trim(),
      placeholder: values.placeholder.trim(),
      sort_order: Number(values.sort_order) || 0,
    };

    const onDone = {
      onSuccess: () => handleClose(),
      onError: (error) => setSubmitError(error.message || "Something went wrong."),
    };

    if (isEditing) {
      updateAttribute({ id: attribute._id, payload }, onDone);
    } else {
      createAttribute(payload, onDone);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography component="span" variant="h6" fontWeight={700}>
          {isEditing ? "Edit Attribute" : "New Attribute"}
        </Typography>
        <IconButton aria-label="Close" onClick={handleClose} size="small" disabled={isPending}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <TextField
                fullWidth
                label="Name (EN)"
                required
                placeholder="Size, Color, Weight..."
                {...register("name", { required: "Name is required." })}
                error={Boolean(errors.name)}
              />
              <FieldError message={errors.name?.message} />
            </Box>
            <TextField
              fullWidth
              label="Name (BN)"
              placeholder="Size, Color, Weight..."
              {...register("name_bn")}
            />
            <TextField
              fullWidth
              label="Slug"
              {...register("slug")}
              onChange={(event) => {
                setSlugEdited(Boolean(event.target.value));
                setValue("slug", event.target.value);
              }}
            />
            <Box>
              <TextField
                fullWidth
                label="Option Placeholder"
                placeholder="S, M, L, XL"
                {...register("placeholder")}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Hint shown when adding product variants
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              inputProps={{ min: 0 }}
              {...register("sort_order")}
            />

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isPending} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : null}
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AttributesManager() {
  const { data: attributes = [], isLoading, isError, error, refetch } = useProductAttributes();
  const { mutate: deleteAttribute, isPending: isDeleting, variables: deletingId } = useDeleteProductAttribute();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  function handleDelete(attribute) {
    if (!window.confirm(`Delete attribute "${attribute.name}"?`)) return;
    deleteAttribute(attribute._id);
  }

  function openCreate() {
    setEditingAttribute(null);
    setModalOpen(true);
  }

  function openEdit(attribute) {
    setEditingAttribute(attribute);
    setModalOpen(true);
  }

  return (
    <Stack spacing={3}>
      <DashPageHeader
        eyebrow="Catalog"
        title="Product Attributes"
        description="Create variation types like Size, Weight, Color — used in variable products."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
            Add Attribute
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
            {error?.message || "Failed to load attributes."}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
            Try again
          </Button>
        </Paper>
      ) : attributes.length === 0 ? (
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
          <TuneRoundedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No attributes yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create Size, Color, Weight or any custom variation type.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            {attributes.map((attribute) => (
              <Box key={attribute._id} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography fontWeight={700}>{attribute.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {attribute.name_bn}
                </Typography>
                <Stack spacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Slug
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {attribute.slug}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Placeholder
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {attribute.placeholder || "—"}
                    </Typography>
                  </Stack>
                </Stack>
                <CardActions
                  onEdit={() => openEdit(attribute)}
                  onDelete={() => handleDelete(attribute)}
                  isDeleting={isDeleting && deletingId === attribute._id}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name (EN)</TableCell>
                  <TableCell>Name (BN)</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Placeholder</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attributes.map((attribute) => (
                  <TableRow key={attribute._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{attribute.name}</TableCell>
                    <TableCell>{attribute.name_bn}</TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace" color="primary">
                        {attribute.slug}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{attribute.placeholder || "—"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="Edit attribute"
                        size="small"
                        onClick={() => openEdit(attribute)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="Delete attribute"
                        size="small"
                        color="error"
                        disabled={isDeleting && deletingId === attribute._id}
                        onClick={() => handleDelete(attribute)}
                      >
                        {isDeleting && deletingId === attribute._id ? (
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

      <AttributeFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAttribute(null);
        }}
        attribute={editingAttribute}
      />
    </Stack>
  );
}
