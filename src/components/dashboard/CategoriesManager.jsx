"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { CardActions, FieldError } from "@/components/dashboard/DashboardFormUi";
import TablePagination from "@/components/dashboard/TablePagination";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { usePagination } from "@/hooks/usePagination";
import { slugify } from "@/lib/slugify";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/hooks/useCategories";

const emptyValues = { name: "", slug: "" };

function CategoryFormModal({ open, onClose, category }) {
  const fileInputRef = useRef(null);
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const isEditing = Boolean(category);
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  const nameValue = watch("name");

  const [slugEdited, setSlugEdited] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitError, setSubmitError] = useState("");

  const nameField = register("name", { required: "Category name is required." });

  function resetImageState() {
    setImageFile(null);
    setExistingImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetAll() {
    reset(emptyValues);
    setSlugEdited(false);
    resetImageState();
    setSubmitError("");
  }

  function handleClose() {
    if (isPending) return;
    resetAll();
    onClose();
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a valid image file.");
      return;
    }

    setSubmitError("");
    if (imageFile && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (imageFile) {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(existingImage?.url || "");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setExistingImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(values) {
    setSubmitError("");

    if (!imageFile && !existingImage) {
      setSubmitError("Category image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name.trim());
    if (values.slug.trim()) formData.append("slug", values.slug.trim());

    const onDone = {
      onSuccess: () => {
        resetAll();
        onClose();
      },
      onError: (error) => {
        setSubmitError(error.message || "Something went wrong.");
      },
    };

    if (isEditing) {
      if (imageFile) formData.append("image", imageFile);
      updateCategory({ id: category._id, formData }, onDone);
    } else {
      if (!imageFile) {
        setSubmitError("Category image is required.");
        return;
      }
      formData.append("image", imageFile);
      createCategory(formData, onDone);
    }
  }

  useEffect(() => {
    if (!open) return;

    if (category) {
      reset({
        name: category.name || "",
        slug: category.slug || "",
      });
      setSlugEdited(true);
      setExistingImage(category.image || null);
      setImagePreview(category.image?.url || "");
      setImageFile(null);
      setSubmitError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      resetAll();
    }
  }, [open, category, reset]);

  useEffect(() => {
    if (!open || slugEdited) return;
    setValue("slug", slugify(nameValue || ""));
  }, [nameValue, slugEdited, open, setValue]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box>
          <Typography variant="caption" fontWeight={700} color="primary" sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {isEditing ? "Edit Category" : "New Category"}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? "Update Category" : "Add Category"}
          </Typography>
        </Box>
        <IconButton aria-label="Close form" onClick={handleClose} disabled={isPending} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <TextField
                id="category-name"
                fullWidth
                label="Category Name"
                required
                placeholder="e.g. Electronics"
                {...nameField}
                onChange={(event) => {
                  nameField.onChange(event);
                  if (!slugEdited) {
                    setValue("slug", slugify(event.target.value));
                  }
                }}
                error={Boolean(errors.name)}
              />
              <FieldError message={errors.name?.message} />
            </Box>

            <TextField
              id="category-slug"
              fullWidth
              label="Slug"
              placeholder="auto-generated-from-name"
              {...register("slug")}
              onChange={(event) => {
                setSlugEdited(true);
                setValue("slug", event.target.value);
              }}
            />

            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Category Image {!isEditing ? "*" : ""}
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              {imagePreview ? (
                <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
                  <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", bgcolor: "grey.50" }}>
                    <Image src={imagePreview} alt="Category preview" fill unoptimized style={{ objectFit: "cover" }} />
                  </Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {imageFile?.name || "Current image"}
                    </Typography>
                    <Button size="small" color="error" onClick={clearImage}>
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    py: 4,
                    borderStyle: "dashed",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <AddPhotoAlternateOutlinedIcon color="primary" />
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    Upload category image
                  </Typography>
                </Button>
              )}

              {imagePreview ? (
                <Button
                  size="small"
                  startIcon={<CloudUploadOutlinedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mt: 1 }}
                >
                  Change image
                </Button>
              ) : null}
            </Box>

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isPending} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending} startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}>
            {isPending
              ? isEditing
                ? "Updating..."
                : "Uploading..."
              : isEditing
                ? "Update Category"
                : "Save Category"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function reorderCategoryList(items, fromId, toId) {
  const next = [...items];
  const fromIndex = next.findIndex((item) => item._id === fromId);
  const toIndex = next.findIndex((item) => item._id === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function CategoryRowActions({ category, onEdit, onDelete, isDeleting }) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <IconButton aria-label="Edit category" title="Edit" size="small" onClick={() => onEdit(category)}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      <IconButton
        aria-label="Delete category"
        title="Delete"
        size="small"
        color="error"
        onClick={() => onDelete(category)}
        disabled={isDeleting}
      >
        {isDeleting ? <CircularProgress size={16} /> : <DeleteOutlineRoundedIcon fontSize="small" />}
      </IconButton>
    </Stack>
  );
}

function CategoryImageThumb({ category, size = 48 }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
      }}
    >
      {category.image?.url ? (
        <Image src={category.image.url} alt={category.name} fill unoptimized style={{ objectFit: "cover" }} />
      ) : (
        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CategoryOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
        </Box>
      )}
    </Box>
  );
}

export default function CategoriesManager({ embedded = false }) {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const { mutate: deleteCategory, isPending: isDeleting, variables: deletingId } = useDeleteCategory();
  const { mutateAsync: reorderCategories, isPending: isReordering } = useReorderCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragIdRef = useRef(null);

  const canReorder = !search.trim();

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(term) ||
        category.slug?.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term)
    );
  }, [categories, search]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredCategories);

  function openCreateForm() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
  }

  function handleDelete(category) {
    if (!window.confirm(`Delete "${category.name}" category?`)) return;
    deleteCategory(category._id);
  }

  function handleDragStart(event, categoryId) {
    if (!canReorder || isReordering) {
      event.preventDefault();
      return;
    }

    dragIdRef.current = categoryId;
    setDraggingId(categoryId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryId);
  }

  function handleDragEnter(categoryId) {
    if (!canReorder || !dragIdRef.current || dragIdRef.current === categoryId) return;
    setDragOverId(categoryId);
  }

  function handleDragOver(event) {
    if (!canReorder) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(event, targetId) {
    event.preventDefault();

    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);

    if (!canReorder || !fromId || fromId === targetId || isReordering) return;

    const reordered = reorderCategoryList(categories, fromId, targetId);

    try {
      await reorderCategories(reordered.map((item) => item._id));
      toast.success("Category order updated");
    } catch (err) {
      toast.error(err.message || "Failed to reorder categories");
    }
  }

  function handleDragEnd() {
    dragIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
  }

  const addCategoryButton = (
    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateForm}>
      Add Category
    </Button>
  );

  return (
    <Stack spacing={3}>
      {embedded ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>{addCategoryButton}</Box>
      ) : (
        <DashPageHeader
          eyebrow="Catalog"
          title="Product Categories"
          description="Add categories with images. Files upload to ImageKit and save in MongoDB."
          action={addCategoryButton}
        />
      )}

      {categories.length > 0 ? (
        <TextField
          fullWidth
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, slug, or description..."
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
          <CircularProgress size={32} />
        </Paper>
      ) : isError ? (
        <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}>
          <Typography variant="body2" color="error">
            {error?.message || "Failed to load categories."}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
            Try again
          </Button>
        </Paper>
      ) : filteredCategories.length === 0 ? (
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
          <CategoryOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            {categories.length === 0 ? "No categories yet" : "No matching categories"}
          </Typography>
          {categories.length === 0 ? (
            <Box sx={{ mt: 2.5 }}>{addCategoryButton}</Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try a different search term.
            </Typography>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}
          >
            <Typography variant="caption" color={canReorder ? "text.secondary" : "warning.main"}>
              {canReorder ? "Drag rows to change storefront order" : "Clear search to reorder categories"}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {isReordering ? <CircularProgress size={14} /> : null}
              <Typography variant="caption" color="text.secondary">
                {filteredCategories.length} {filteredCategories.length === 1 ? "item" : "items"}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            {paginatedItems.map((category, index) => {
              const serial = (page - 1) * pageSize + index + 1;

              return (
                <Box key={category._id} sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Stack direction="row" spacing={1.5}>
                    <CategoryImageThumb category={category} size={64} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {category.name}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            /{category.slug}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.disabled">
                          #{serial}
                        </Typography>
                      </Stack>
                      {category.description ? (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {category.description}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                  <CardActions
                    onEdit={() => openEditForm(category)}
                    onDelete={() => handleDelete(category)}
                    isDeleting={isDeleting && deletingId === category._id}
                  />
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64 }}>#</TableCell>
                  <TableCell sx={{ width: 80 }}>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((category, index) => {
                  const serial = (page - 1) * pageSize + index + 1;
                  const canDrag = canReorder && !isReordering;
                  const isDragging = draggingId === category._id;
                  const isDragOver = dragOverId === category._id;

                  return (
                    <TableRow
                      key={category._id}
                      hover
                      draggable={canDrag}
                      onDragStart={(event) => handleDragStart(event, category._id)}
                      onDragEnter={() => handleDragEnter(category._id)}
                      onDragOver={handleDragOver}
                      onDrop={(event) => handleDrop(event, category._id)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        cursor: canDrag ? "grab" : "default",
                        opacity: isDragging ? 0.5 : 1,
                        bgcolor: isDragOver ? "primary.50" : undefined,
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
                          {canDrag ? <DragIndicatorRoundedIcon fontSize="small" /> : null}
                          <Typography variant="caption" fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {serial}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <CategoryImageThumb category={category} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          /{category.slug}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        {category.description ? (
                          <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {category.description}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <CategoryRowActions
                          category={category}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          isDeleting={isDeleting && deletingId === category._id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      <CategoryFormModal open={formOpen} onClose={closeForm} category={editingCategory} />
    </Stack>
  );
}
