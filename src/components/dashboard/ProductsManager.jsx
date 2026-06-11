"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, Loader2, Package, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import { calculateDiscountPercentage } from "@/lib/productHelpers";
import { slugify } from "@/lib/slugify";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/dashboard/TablePagination";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
} from "@/components/shared/ResponsiveTable";

const inputClass =
  "w-full border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-dash-text";

const emptyValues = {
  title_bn: "",
  title_en: "",
  slug: "",
  brand_or_vendor: "",
  category: "",
  description: "",
  regular_price: "",
  sale_price: "",
  quantity: "",
  stock_status: "in_stock",
  variant_type: "",
  variant_options: "",
  attribute_material: "",
  average_rating: "0",
  total_reviews: "0",
};

function SectionTitle({ children }) {
  return (
    <h3 className="border-b border-dash-border pb-2 text-xs font-bold tracking-[0.14em] text-dash-muted uppercase">
      {children}
    </h3>
  );
}

function ProductFormModal({ open, onClose, product }) {
  const fileInputRef = useRef(null);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const isEditing = Boolean(product);
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
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitError, setSubmitError] = useState("");

  const regularPrice = watch("regular_price");
  const salePrice = watch("sale_price");
  const variantType = watch("variant_type");
  const discountPreview = useMemo(
    () => calculateDiscountPercentage(regularPrice, salePrice),
    [regularPrice, salePrice]
  );

  const titleEnValue = watch("title_en");
  const titleBnField = register("title_bn", { required: "পণ্যের নাম লিখুন।" });
  const titleEnField = register("title_en", { required: "English title is required." });
  const categoryField = register("category", { required: "Please select a category." });
  const regularPriceField = register("regular_price", {
    required: "Regular price is required.",
    validate: (value) => Number(value) > 0 || "Regular price must be greater than 0.",
  });
  const salePriceField = register("sale_price", {
    required: "Sale price is required.",
    validate: (value, formValues) => {
      const sale = Number(value);
      const regular = Number(formValues.regular_price);
      if (sale <= 0) return "Sale price must be greater than 0.";
      if (sale > regular) return "Sale price cannot exceed regular price.";
      return true;
    },
  });

  function resetImages() {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetAll() {
    reset(emptyValues);
    setSlugEdited(false);
    resetImages();
    setSubmitError("");
  }

  function handleClose() {
    if (isPending) return;
    resetAll();
    onClose();
  }

  function handleImagesChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const invalid = files.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setSubmitError("Only image files are allowed.");
      return;
    }

    setSubmitError("");
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(index) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values) {
    setSubmitError("");

    const totalImages = existingImages.length + imageFiles.length;
    if (!isEditing && !imageFiles.length) {
      setSubmitError("At least one product image is required.");
      return;
    }
    if (isEditing && totalImages === 0) {
      setSubmitError("At least one product image is required.");
      return;
    }

    const formData = new FormData();
    const titleBn = values.title_bn.trim();
    const titleEn = values.title_en.trim();
    formData.append("title_bn", titleBn);
    formData.append("title_en", titleEn);
    formData.append("slug", values.slug.trim());
    formData.append("brand_or_vendor", values.brand_or_vendor.trim());
    formData.append("category", values.category);
    const selectedCategory = categories.find((item) => item.name === values.category);
    if (selectedCategory) {
      formData.append("category_id", selectedCategory._id);
      formData.append("category_slug", selectedCategory.slug);
    }
    formData.append("description", values.description.trim());
    formData.append("currency", "BDT");
    formData.append("regular_price", values.regular_price);
    formData.append("sale_price", values.sale_price);
    formData.append("quantity", values.quantity || "0");
    formData.append("stock_status", values.stock_status);
    formData.append("variant_type", values.variant_type);
    formData.append("variant_options", values.variant_options.trim());
    formData.append("attribute_material", values.attribute_material.trim());
    formData.append("average_rating", values.average_rating || "0");
    formData.append("total_reviews", values.total_reviews || "0");

    if (isEditing) {
      formData.append("existing_images", JSON.stringify(existingImages));
    }

    imageFiles.forEach((file) => formData.append("images", file));

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
      updateProduct({ id: product._id, formData }, onDone);
    } else {
      createProduct(formData, onDone);
    }
  }

  useEffect(() => {
    if (!open) return;

    if (product) {
      reset({
        title_bn: product.title_bn || "",
        title_en: product.title_en || "",
        slug: product.slug || "",
        brand_or_vendor: product.brand_or_vendor || "",
        category: product.category || "",
        description: product.description || "",
        regular_price: String(product.pricing?.regular_price ?? ""),
        sale_price: String(product.pricing?.sale_price ?? ""),
        quantity: String(product.inventory?.quantity ?? ""),
        stock_status: product.inventory?.stock_status || "in_stock",
        variant_type: product.attributes?.variant_type || (product.attributes?.size ? "size" : ""),
        variant_options: product.attributes?.variant_options || product.attributes?.size || "",
        attribute_material: product.attributes?.material || "",
        average_rating: String(product.ratings?.average_rating ?? "0"),
        total_reviews: String(product.ratings?.total_reviews ?? "0"),
      });
      setSlugEdited(true);
      setExistingImages(product.images || []);
      setImageFiles([]);
      setImagePreviews([]);
      setSubmitError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      resetAll();
    }
  }, [open, product, reset]);

  useEffect(() => {
    if (!open || slugEdited) return;
    setValue("slug", slugify(titleEnValue || ""));
  }, [titleEnValue, slugEdited, open, setValue]);

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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

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
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="rounded-md fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-dash-border bg-white shadow-2xl sm:inset-x-3 sm:bottom-auto sm:top-[4vh] sm:max-h-[92vh] sm:rounded-md sm:max-w-4xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-dash-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
                  {isEditing ? "Edit Product" : "New Product"}
                </p>
                <h2 className="text-lg font-bold text-dash-text">
                  {isEditing ? "Update Product" : "Add Product"}
                </h2>
              </div>
              <button type="button" onClick={handleClose} disabled={isPending} className="rounded-md flex h-9 w-9 items-center justify-center border border-dash-border text-dash-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
                <section className="space-y-4">
                  <SectionTitle>Basic Information</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="title-bn" className={labelClass}>
                        পণ্যের নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title-bn"
                        {...titleBnField}
                        placeholder="প্রিমিয়াম ম্যাজিক মশারি"
                        className={inputClass}
                      />
                      <FieldError message={errors.title_bn?.message} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="title-en" className={labelClass}>
                        English Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title-en"
                        {...titleEnField}
                        onChange={(event) => {
                          titleEnField.onChange(event);
                          if (!slugEdited) setValue("slug", slugify(event.target.value));
                        }}
                        placeholder="Premium Magic Mosquito Net"
                        className={inputClass}
                      />
                      <FieldError message={errors.title_en?.message} />
                    </div>
                    <div>
                      <label htmlFor="slug" className={labelClass}>Slug (অটো)</label>
                      <input
                        id="slug"
                        {...register("slug")}
                        onChange={(event) => {
                          setSlugEdited(true);
                          setValue("slug", event.target.value);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="brand" className={labelClass}>Brand / Vendor</label>
                      <input id="brand" {...register("brand_or_vendor")} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="category" className={labelClass}>
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select id="category" {...categoryField} className={inputClass}>
                        <option value="">Select category</option>
                        {categories.map((item) => (
                          <option key={item._id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      <FieldError message={errors.category?.message} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className={labelClass}>Description</label>
                      <textarea id="description" rows={3} {...register("description")} className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <SectionTitle>Pricing & Inventory</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label htmlFor="regular-price" className={labelClass}>
                        Regular Price (BDT) <span className="text-red-500">*</span>
                      </label>
                      <input id="regular-price" type="number" min="1" {...regularPriceField} className={inputClass} />
                      <FieldError message={errors.regular_price?.message} />
                    </div>
                    <div>
                      <label htmlFor="sale-price" className={labelClass}>
                        Sale Price (BDT) <span className="text-red-500">*</span>
                      </label>
                      <input id="sale-price" type="number" min="1" {...salePriceField} className={inputClass} />
                      <FieldError message={errors.sale_price?.message} />
                    </div>
                    <div>
                      <label className={labelClass}>Discount</label>
                      <div className="rounded-md flex h-[42px] items-center border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
                        {discountPreview > 0 ? `${discountPreview}% OFF` : "—"}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="quantity" className={labelClass}>Quantity</label>
                      <input id="quantity" type="number" min="0" {...register("quantity")} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="stock-status" className={labelClass}>Stock Status</label>
                      <select id="stock-status" {...register("stock_status")} className={inputClass}>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="low_stock">Low Stock</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <SectionTitle>Attributes & Ratings</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label htmlFor="variant-type" className={labelClass}>Variant Type</label>
                      <select id="variant-type" {...register("variant_type")} className={inputClass}>
                        <option value="">None</option>
                        <option value="size">Size</option>
                        <option value="weight">Weight</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="variant-options" className={labelClass}>
                        {variantType === "weight" ? "Weight Options" : variantType === "size" ? "Size Options" : "Variant Options"}
                      </label>
                      <input
                        id="variant-options"
                        {...register("variant_options", {
                          validate: (value, formValues) => {
                            if (!formValues.variant_type) return true;
                            return value.trim().length > 0 || "Add at least one option (comma separated).";
                          },
                        })}
                        placeholder={
                          variantType === "weight"
                            ? "500g, 1kg, 2kg"
                            : variantType === "size"
                              ? "S, M, L, XL"
                              : "Select type first"
                        }
                        disabled={!variantType}
                        className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
                      />
                      <FieldError message={errors.variant_options?.message} />
                      {variantType ? (
                        <p className="mt-1 text-[11px] text-dash-muted">Comma separated values</p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="material" className={labelClass}>Material</label>
                      <input id="material" {...register("attribute_material")} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="rating" className={labelClass}>Average Rating</label>
                      <input id="rating" type="number" min="0" max="5" step="0.1" {...register("average_rating")} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label htmlFor="reviews" className={labelClass}>Total Reviews</label>
                      <input id="reviews" type="number" min="0" {...register("total_reviews")} className={inputClass} />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <SectionTitle>Product Images</SectionTitle>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md flex w-full flex-col items-center justify-center gap-2 border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <ImagePlus className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-semibold text-dash-text">Upload product images</span>
                  </button>

                  {existingImages.length > 0 || imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {existingImages.map((image, index) => (
                        <div key={`existing-${image.fileId || image.url}-${index}`} className="rounded-md relative aspect-square overflow-hidden border border-dash-border bg-slate-50">
                          <Image src={image.url} alt="" fill unoptimized className="object-cover" />
                          <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center bg-white/95 text-red-600 shadow">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.map((preview, index) => (
                        <div key={preview} className="rounded-md relative aspect-square overflow-hidden border border-dash-border bg-slate-50">
                          <Image src={preview} alt="" fill unoptimized className="object-cover" />
                          <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center bg-white/95 text-red-600 shadow">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>

                {submitError ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-dash-border bg-white p-5 sm:flex-row sm:justify-end sm:px-6">
                <button type="button" onClick={handleClose} disabled={isPending} className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted">
                  Cancel
                </button>
                <motion.button type="submit" disabled={isPending} whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {isEditing ? "Update Product" : "Save Product"}
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

function ProductRowActions({ product, onEdit, onDelete, isDeleting }) {
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Edit product"
        title="Edit"
        onClick={() => onEdit(product)}
        className={`${iconBtn} border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete product"
        title="Delete"
        onClick={() => onDelete(product)}
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

export default function ProductsManager() {
  const { data: products = [], isLoading, isError, error, refetch } = useProducts();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteProduct, isPending: isDeleting, variables: deletingId } = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      if (categoryFilter !== "all") {
        const selectedCategory = categories.find((entry) => entry._id === categoryFilter);
        const matchesId = product.category_id === categoryFilter;
        const matchesName =
          selectedCategory && product.category === selectedCategory.name;
        const matchesSlug =
          selectedCategory &&
          product.category_slug === selectedCategory.slug;

        if (!matchesId && !matchesName && !matchesSlug) return false;
      }

      if (!term) return true;

      return (
        product.title_en?.toLowerCase().includes(term) ||
        product.title_bn?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.brand_or_vendor?.toLowerCase().includes(term) ||
        product.slug?.toLowerCase().includes(term)
      );
    });
  }, [products, search, categoryFilter, categories]);

  const { page, setPage, totalPages, totalItems, pageSize, paginatedItems } =
    usePagination(filteredProducts);

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingProduct(null);
  }

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.title_bn || product.title_en}"?`)) return;
    deleteProduct(product._id);
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">Catalog</p>
          <h1 className="text-2xl font-bold text-dash-text">Product Catalog</h1>
          <p className="mt-1 text-sm text-dash-muted">Add products with pricing, inventory, attributes, and ImageKit uploads.</p>
        </div>
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 self-start bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Product
        </motion.button>
      </motion.div>

      {products.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, brand, or slug..."
            className={`${inputClass} sm:max-w-sm sm:flex-1`}
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isLoading ? (
        <div className="dash-card flex min-h-[280px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load products."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">Try again</button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="dash-card flex min-h-[280px] flex-col items-center justify-center p-10 text-center">
          <Package className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">
            {products.length === 0 ? "No products yet" : "No matching products"}
          </h2>
          {products.length === 0 ? (
            <button type="button" onClick={openCreateForm} className="mt-5 inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          ) : (
            <p className="mt-2 text-sm text-dash-muted">
              Try a different search term or category filter.
            </p>
          )}
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="p-3">
            {paginatedItems.map((product, index) => {
              const mainImage = product.images?.[0]?.url;
              const discount = product.pricing?.discount_percentage || 0;
              const stockStatus = product.inventory?.stock_status?.replace(/_/g, " ") || "—";

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <MobileDashCard>
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-dash-border bg-slate-100">
                        {mainImage ? (
                          <Image src={mainImage} alt={product.title_bn || product.title_en} fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-dash-muted">
                            <Package className="h-4 w-4 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-semibold text-dash-text">
                          {product.title_bn || product.title_en}
                        </p>
                        <span className="mt-2 inline-block rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <MobileDashRow
                        label="Price"
                        value={`৳${product.pricing?.sale_price?.toLocaleString()}${discount > 0 ? ` (-${discount}%)` : ""}`}
                      />
                      <MobileDashRow label="Stock" value={`${stockStatus} · Qty ${product.inventory?.quantity ?? 0}`} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <ProductRowActions
                        product={product}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                        isDeleting={isDeleting && deletingId === product._id}
                      />
                    </div>
                  </MobileDashCard>
                </motion.div>
              );
            })}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((product, index) => {
                  const mainImage = product.images?.[0]?.url;
                  const discount = product.pricing?.discount_percentage || 0;
                  const stockStatus = product.inventory?.stock_status?.replace(/_/g, " ") || "—";

                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-dash-border last:border-b-0 hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-dash-border bg-slate-100">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={product.title_bn || product.title_en}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-dash-muted">
                              <Package className="h-4 w-4 opacity-40" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <p className="line-clamp-1 font-semibold text-dash-text">
                          {product.title_bn || product.title_en}
                        </p>
                        {product.brand_or_vendor ? (
                          <p className="mt-0.5 text-xs text-dash-muted">{product.brand_or_vendor}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-dash-text">
                          ৳{product.pricing?.sale_price?.toLocaleString()}
                        </p>
                        {product.pricing?.regular_price > product.pricing?.sale_price ? (
                          <p className="text-xs text-dash-muted line-through">
                            ৳{product.pricing.regular_price.toLocaleString()}
                          </p>
                        ) : null}
                        {discount > 0 ? (
                          <span className="mt-1 inline-block rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            -{discount}%
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold capitalize text-dash-text">{stockStatus}</p>
                        <p className="text-xs text-dash-muted">Qty: {product.inventory?.quantity ?? 0}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ProductRowActions
                          product={product}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          isDeleting={isDeleting && deletingId === product._id}
                        />
                      </td>
                    </motion.tr>
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

      <ProductFormModal open={formOpen} onClose={closeForm} product={editingProduct} />
    </div>
  );
}
