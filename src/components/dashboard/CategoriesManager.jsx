"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import {
  GripVertical,
  ImagePlus,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import TablePagination from "@/components/dashboard/TablePagination";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  mobileDashModalClass,
} from "@/components/shared/ResponsiveTable";
import { usePagination } from "@/hooks/usePagination";
import { slugify } from "@/lib/slugify";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/hooks/useCategories";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

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

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === "Escape") handleClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, isPending]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className={`${mobileDashModalClass} sm:max-w-lg`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-4 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
                  {isEditing ? "Edit Category" : "New Category"}
                </p>
                <h2 className="text-lg font-bold text-dash-text">
                  {isEditing ? "Update Category" : "Add Category"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-md flex h-9 w-9 items-center justify-center border border-dash-border text-dash-muted hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              <div>
                <label htmlFor="category-name" className="mb-1.5 block text-sm font-semibold text-dash-text">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-name"
                  {...nameField}
                  onChange={(event) => {
                    nameField.onChange(event);
                    if (!slugEdited) {
                      setValue("slug", slugify(event.target.value));
                    }
                  }}
                  placeholder="e.g. Electronics"
                  className={inputClass}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <label htmlFor="category-slug" className="mb-1.5 block text-sm font-semibold text-dash-text">
                  Slug
                </label>
                <input
                  id="category-slug"
                  {...register("slug")}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setValue("slug", event.target.value);
                  }}
                  placeholder="auto-generated-from-name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-dash-text">
                  Category Image {!isEditing ? <span className="text-red-500">*</span> : null}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="rounded-md relative overflow-hidden border border-dash-border bg-slate-50">
                    <div className="relative aspect-[16/9] w-full">
                      <Image src={imagePreview} alt="Category preview" fill unoptimized className="object-cover" />
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-dash-border px-3 py-2">
                      <p className="truncate text-xs text-dash-muted">{imageFile?.name || "Current image"}</p>
                      <button type="button" onClick={clearImage} className="text-xs font-semibold text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md flex w-full flex-col items-center justify-center gap-2 border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-8 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <span className="rounded-md flex h-12 w-12 items-center justify-center border border-indigo-200 bg-white text-indigo-600">
                      <ImagePlus className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-dash-text">Upload category image</span>
                  </button>
                )}

                {imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Change image
                  </button>
                ) : null}
              </div>

              {submitError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
              ) : null}

              </div>
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-dash-border bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {isEditing ? "Update Category" : "Save Category"}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
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
  const iconBtn =
    "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors";

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        aria-label="Edit category"
        title="Edit"
        onClick={() => onEdit(category)}
        className={`${iconBtn} text-slate-400 hover:bg-slate-100 hover:text-indigo-600`}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Delete category"
        title="Delete"
        onClick={() => onDelete(category)}
        disabled={isDeleting}
        className={`${iconBtn} text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50`}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}

function CategoryImageThumb({ category, size = "md" }) {
  const sizeClass = size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 shadow-sm`}>
      {category.image?.url ? (
        <Image src={category.image.url} alt={category.name} fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-dash-muted">
          <Layers className="h-4 w-4 opacity-40" />
        </div>
      )}
    </div>
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

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex justify-end">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateForm}
            className="inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">Catalog</p>
            <h1 className="text-xl font-bold text-dash-text sm:text-2xl">Product Categories</h1>
            <p className="mt-1 text-sm text-dash-muted">
              Add categories with images. Files upload to ImageKit and save in MongoDB.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 self-start bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </motion.button>
        </motion.div>
      )}

      {categories.length > 0 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, slug, or description..."
          className={`${inputClass} w-full`}
        />
      ) : null}

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load categories."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
            Try again
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <Layers className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {categories.length === 0 ? "No categories yet" : "No matching categories"}
          </h2>
          {categories.length === 0 ? (
            <button type="button" onClick={openCreateForm} className="mt-5 inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          ) : (
            <p className="mt-2 text-sm text-dash-muted">Try a different search term.</p>
          )}
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border px-4 py-3 sm:px-5">
            <div>
              {canReorder ? (
                <p className="text-xs text-slate-500">Drag rows to change storefront order</p>
              ) : (
                <p className="text-xs text-amber-600">Clear search to reorder categories</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isReordering ? <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> : null}
              <span>
                {filteredCategories.length} {filteredCategories.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <MobileCardList className="space-y-0 divide-y divide-dash-border p-0 lg:hidden">
            {paginatedItems.map((category, index) => {
              const serial = (page - 1) * pageSize + index + 1;

              return (
                <div key={category._id} className="p-3.5">
                  <MobileDashCard className="border-0 p-0 shadow-none">
                    <div className="flex gap-3">
                      <CategoryImageThumb category={category} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-dash-text">{category.name}</p>
                            <p className="mt-0.5 text-xs text-indigo-600">/{category.slug}</p>
                          </div>
                          <span className="shrink-0 text-[11px] font-medium text-slate-400">#{serial}</span>
                        </div>
                      </div>
                    </div>
                    {category.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{category.description}</p>
                    ) : null}
                    <div className="mt-3 flex justify-end border-t border-dash-border pt-3">
                      <CategoryRowActions
                        category={category}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === category._id}
                      />
                    </div>
                  </MobileDashCard>
                </div>
              );
            })}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50/90">
                  <th className="w-16 px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    #
                  </th>
                  <th className="w-20 px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Image
                  </th>
                  <th className="min-w-[160px] px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Slug
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Description
                  </th>
                  <th className="w-[88px] px-4 py-2.5 text-right text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((category, index) => {
                  const serial = (page - 1) * pageSize + index + 1;
                  const canDrag = canReorder && !isReordering;
                  const isDragging = draggingId === category._id;
                  const isDragOver = dragOverId === category._id;

                  return (
                    <tr
                      key={category._id}
                      draggable={canDrag}
                      onDragStart={(event) => handleDragStart(event, category._id)}
                      onDragEnter={() => handleDragEnter(category._id)}
                      onDragOver={handleDragOver}
                      onDrop={(event) => handleDrop(event, category._id)}
                      onDragEnd={handleDragEnd}
                      className={`group transition-colors hover:bg-slate-50/70 ${
                        isDragOver ? "bg-indigo-50/60" : ""
                      } ${isDragging ? "opacity-50" : ""} ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {canDrag ? (
                            <GripVertical className="h-4 w-4 shrink-0" />
                          ) : null}
                          <span className="text-xs font-medium tabular-nums text-slate-500">
                            {serial}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <CategoryImageThumb category={category} />
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] font-medium text-dash-text">{category.name}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-medium text-indigo-600">/{category.slug}</span>
                      </td>
                      <td className="max-w-[240px] px-4 py-2.5 text-[13px] text-slate-500">
                        {category.description ? (
                          <p className="line-clamp-2">{category.description}</p>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="opacity-80 transition-opacity group-hover:opacity-100">
                          <CategoryRowActions
                            category={category}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                            isDeleting={isDeleting && deletingId === category._id}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DesktopTable>

          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}

      <CategoryFormModal open={formOpen} onClose={closeForm} category={editingCategory} />
    </div>
  );
}
