"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, Layers, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import TablePagination from "@/components/dashboard/TablePagination";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
} from "@/components/shared/ResponsiveTable";
import { usePagination } from "@/hooks/usePagination";
import { slugify } from "@/lib/slugify";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";

const inputClass =
  "w-full border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const emptyValues = { name: "", slug: "", description: "" };

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
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

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
    formData.append("description", values.description.trim());
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
        description: category.description || "",
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
            className="rounded-md fixed inset-x-4 top-[8vh] z-50 mx-auto max-h-[84vh] w-full max-w-lg overflow-y-auto border border-dash-border bg-white shadow-2xl sm:inset-x-auto sm:top-[10vh]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-dash-border bg-white px-5 py-4 sm:px-6">
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
              <div>
                <label htmlFor="category-name" className="mb-1.5 block text-sm font-semibold text-dash-text">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="category-name"
                  {...nameField}
                  onChange={(event) => {
                    nameField.onChange(event);
                    if (!slugEdited) setValue("slug", slugify(event.target.value));
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
                <label htmlFor="category-description" className="mb-1.5 block text-sm font-semibold text-dash-text">
                  Description
                </label>
                <textarea
                  id="category-description"
                  rows={3}
                  {...register("description")}
                  placeholder="Short description for this category"
                  className={`${inputClass} resize-none`}
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

              <div className="flex flex-col-reverse gap-2 border-t border-dash-border pt-4 sm:flex-row sm:justify-end">
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

function CategoryRowActions({ category, onEdit, onDelete, isDeleting }) {
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Edit category"
        title="Edit"
        onClick={() => onEdit(category)}
        className={`${iconBtn} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete category"
        title="Delete"
        onClick={() => onDelete(category)}
        disabled={isDeleting}
        className={`${iconBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60`}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function CategoriesManager() {
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const { mutate: deleteCategory, isPending: isDeleting, variables: deletingId } = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">Catalog</p>
          <h1 className="text-2xl font-bold text-dash-text">Product Categories</h1>
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

      {categories.length > 0 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, slug, or description..."
          className={`${inputClass} max-w-md`}
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
          <MobileCardList className="p-3">
            {paginatedItems.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <MobileDashCard>
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-dash-border bg-slate-100">
                      {category.image?.url ? (
                        <Image src={category.image.url} alt={category.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-dash-muted">
                          <Layers className="h-4 w-4 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-dash-text">{category.name}</p>
                      <p className="mt-0.5 break-all text-xs text-indigo-600">/{category.slug}</p>
                    </div>
                  </div>
                  {category.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-dash-muted">{category.description}</p>
                  ) : null}
                  <div className="mt-3 flex justify-end">
                    <CategoryRowActions
                      category={category}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      isDeleting={isDeleting && deletingId === category._id}
                    />
                  </div>
                </MobileDashCard>
              </motion.div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((category, index) => (
                  <motion.tr
                    key={category._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-dash-border last:border-b-0 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-dash-border bg-slate-100">
                        {category.image?.url ? (
                          <Image
                            src={category.image.url}
                            alt={category.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-dash-muted">
                            <Layers className="h-4 w-4 opacity-40" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-dash-text">{category.name}</td>
                    <td className="px-4 py-3">
                      <span className="break-all text-xs font-medium text-indigo-600">/{category.slug}</span>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-dash-muted">
                      {category.description ? (
                        <p className="line-clamp-2">{category.description}</p>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryRowActions
                        category={category}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === category._id}
                      />
                    </td>
                  </motion.tr>
                ))}
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
