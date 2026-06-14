"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, ImagePlus, Loader2, Star, Tag, Upload, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import { calculateDiscountPercentage } from "@/lib/productHelpers";
import { inferProductType, PRODUCT_TYPES } from "@/lib/productPricing";
import { slugify } from "@/lib/slugify";
import { findProductAttribute, parseVariantOptions } from "@/lib/productVariants";
import {
  mergeVariantStockWithOptions,
  VARIANT_STOCK_OPTIONS,
} from "@/lib/variantStock";
import { useCategories } from "@/hooks/useCategories";
import { useProductAttributes } from "@/hooks/useProductAttributes";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-dash-text";

const emptyValues = {
  product_type: PRODUCT_TYPES.REGULAR,
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
  average_rating: "0",
  total_reviews: "0",
};

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <h3 className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">{children}</h3>
      {action}
    </div>
  );
}

function FormSection({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-100/90 bg-slate-50/35 p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

function ProductTypeOption({ active, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3.5 text-left transition-all ${
        active
          ? "border-indigo-300 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-100"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-dash-text"}`}>{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </button>
  );
}

function VariantDiscount({ regularPrice, salePrice }) {
  const discount = calculateDiscountPercentage(regularPrice, salePrice);
  return (
    <span className="inline-flex min-h-[42px] items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
      {discount > 0 ? `${discount}% OFF` : "—"}
    </span>
  );
}

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  function addTag(raw) {
    const value = raw.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(input);
      setInput("");
    } else if (event.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-dash-border bg-white px-2 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((entry) => entry !== tag))}
              className="text-indigo-400 hover:text-indigo-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) {
              addTag(input);
              setInput("");
            }
          }}
          placeholder={tags.length ? "Add another tag..." : "Type and press Enter"}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="text-[11px] text-dash-muted">Press Enter or comma to add tags</p>
    </div>
  );
}

function ProductImagesPanel({
  existingImages,
  imagePreviews,
  onUploadClick,
  onRemoveExisting,
  onRemoveNew,
}) {
  const items = [
    ...existingImages.map((image, index) => ({ kind: "existing", index, url: image.url })),
    ...imagePreviews.map((url, index) => ({ kind: "new", index, url })),
  ];

  const featured = items[0] || null;
  const gallery = items.slice(1);

  function removeItem(item) {
    if (item.kind === "existing") onRemoveExisting(item.index);
    else onRemoveNew(item.index);
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Product Image</SectionTitle>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Main image shown in catalog and product page.
        </p>
        <div className="mt-4">
          {featured ? (
            <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
              <Image src={featured.url} alt="Featured product" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => removeItem(featured)}
                className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow-md transition-colors hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                Featured
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onUploadClick}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-indigo-200/80 bg-indigo-50/50 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-dash-text">Upload main image</span>
              <span className="text-[11px] text-slate-500">PNG, JPG up to 10MB</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <SectionTitle
          action={
            <button
              type="button"
              onClick={onUploadClick}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Add
            </button>
          }
        >
          Product Gallery
        </SectionTitle>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Additional photos for the product detail page.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {gallery.map((item) => (
            <div
              key={`${item.kind}-${item.index}-${item.url}`}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm"
            >
              <Image src={item.url} alt="" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-red-600 shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onUploadClick}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-600 ${
              gallery.length ? "aspect-square" : "col-span-2 min-h-[108px]"
            }`}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs font-medium">Add gallery images</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductForm({ product = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: productAttributes = [] } = useProductAttributes();
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
  const [variantStock, setVariantStock] = useState([]);
  const [tags, setTags] = useState([]);

  const productType = watch("product_type");
  const regularPrice = watch("regular_price");
  const salePrice = watch("sale_price");
  const variantType = watch("variant_type");
  const variantOptionsValue = watch("variant_options");
  const stockStatus = watch("stock_status");
  const titleEnValue = watch("title_en");
  const titleBnValue = watch("title_bn");
  const isVariable = productType === PRODUCT_TYPES.VARIABLE;

  const selectedAttribute = useMemo(
    () => findProductAttribute(productAttributes, variantType),
    [productAttributes, variantType]
  );

  const parsedVariantOptions = useMemo(
    () => (isVariable && variantType ? parseVariantOptions(variantOptionsValue) : []),
    [isVariable, variantType, variantOptionsValue]
  );

  const discountPreview = useMemo(
    () => calculateDiscountPercentage(regularPrice, salePrice),
    [regularPrice, salePrice]
  );

  const titleBnField = register("title_bn", { required: "পণ্যের নাম লিখুন।" });
  const titleEnField = register("title_en", { required: "English title is required." });
  const categoryField = register("category", { required: "Please select a category." });
  const regularPriceField = register("regular_price", {
    validate: (value, formValues) => {
      if (formValues.product_type !== PRODUCT_TYPES.REGULAR) return true;
      if (!(Number(value) > 0)) return "Regular price must be greater than 0.";
      return true;
    },
  });
  const salePriceField = register("sale_price", {
    validate: (value, formValues) => {
      if (formValues.product_type !== PRODUCT_TYPES.REGULAR) return true;
      const sale = Number(value);
      const regular = Number(formValues.regular_price);
      if (!(sale > 0)) return "Sale price must be greater than 0.";
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
    setVariantStock([]);
    setTags([]);
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

  function updateVariantEntry(option, patch) {
    setVariantStock((current) =>
      current.map((item) => (item.option === option ? { ...item, ...patch } : item))
    );
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

    if (isVariable) {
      if (!values.variant_type) {
        setSubmitError("Select an attribute for variable product.");
        return;
      }
      if (!parsedVariantOptions.length) {
        setSubmitError("Add at least one variant option.");
        return;
      }
      for (const entry of variantStock) {
        const regular = Number(entry.regular_price);
        const sale = Number(entry.sale_price);
        if (!(regular > 0)) {
          setSubmitError(`${entry.option}: Regular price is required.`);
          return;
        }
        if (!(sale > 0) || sale > regular) {
          setSubmitError(`${entry.option}: Invalid sale price.`);
          return;
        }
      }
    }

    const formData = new FormData();
    formData.append("product_type", values.product_type);
    formData.append("title_bn", values.title_bn.trim());
    formData.append("title_en", values.title_en.trim());
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
    formData.append("tags", JSON.stringify(tags));

    if (isVariable) {
      formData.append("variant_stock", JSON.stringify(variantStock));
      formData.append("regular_price", "0");
      formData.append("sale_price", "0");
      formData.append("quantity", "0");
      formData.append("stock_status", "in_stock");
      formData.append("variant_type", values.variant_type);
      formData.append("variant_options", values.variant_options.trim());
      formData.append("variant_label", selectedAttribute?.name || "");
      formData.append("variant_label_bn", selectedAttribute?.name_bn || "");
      formData.append("variant_placeholder", selectedAttribute?.placeholder || "");
    } else {
      formData.append("regular_price", values.regular_price);
      formData.append("sale_price", values.sale_price);
      formData.append("quantity", values.quantity || "0");
      formData.append("stock_status", values.stock_status);
      formData.append("variant_type", "");
      formData.append("variant_options", "");
    }

    formData.append("average_rating", values.average_rating || "0");
    formData.append("total_reviews", values.total_reviews || "0");

    if (isEditing) {
      formData.append("existing_images", JSON.stringify(existingImages));
    }

    imageFiles.forEach((file) => formData.append("images", file));

    const onDone = {
      onSuccess: () => router.push("/dashboard/products"),
      onError: (error) => setSubmitError(error.message || "Something went wrong."),
    };

    if (isEditing) {
      updateProduct({ id: product._id, formData }, onDone);
    } else {
      createProduct(formData, onDone);
    }
  }

  useEffect(() => {
    if (!product) {
      resetAll();
      return;
    }

    const inferredType = inferProductType(product);
    const options = parseVariantOptions(
      product.attributes?.variant_options || product.attributes?.size || ""
    );

    reset({
      product_type: inferredType,
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
      average_rating: String(product.ratings?.average_rating ?? "0"),
      total_reviews: String(product.ratings?.total_reviews ?? "0"),
    });

    setTags(Array.isArray(product.tags) ? product.tags : []);
    setSlugEdited(Boolean(product.slug));
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setSubmitError("");
    setVariantStock(
      mergeVariantStockWithOptions(
        options,
        product.inventory?.variant_stock || [],
        product.inventory || {}
      ).map((entry) => ({
        ...entry,
        regular_price:
          entry.regular_price != null && entry.regular_price !== ""
            ? entry.regular_price
            : inferredType === PRODUCT_TYPES.VARIABLE
              ? product.pricing?.regular_price || ""
              : "",
        sale_price:
          entry.sale_price != null && entry.sale_price !== ""
            ? entry.sale_price
            : inferredType === PRODUCT_TYPES.VARIABLE
              ? product.pricing?.sale_price || ""
              : "",
      }))
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [product, reset]);

  useEffect(() => {
    if (!isVariable || !variantType) {
      setVariantStock([]);
      return;
    }
    if (!parsedVariantOptions.length) {
      setVariantStock([]);
      return;
    }
    setVariantStock((current) => mergeVariantStockWithOptions(parsedVariantOptions, current));
  }, [isVariable, variantType, parsedVariantOptions.join("|")]);

  useEffect(() => {
    if (slugEdited) return;
    setValue("slug", slugify(titleEnValue || titleBnValue || ""));
  }, [titleEnValue, titleBnValue, slugEdited, setValue]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  function handleProductTypeChange(type) {
    setValue("product_type", type, { shouldValidate: true });
    if (type === PRODUCT_TYPES.REGULAR) {
      setValue("variant_type", "");
      setValue("variant_options", "");
      setVariantStock([]);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/products"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dash-border bg-white text-dash-muted shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
              {isEditing ? "Edit Product" : "New Product"}
            </p>
            <h1 className="text-xl font-bold text-dash-text sm:text-2xl">
              {isEditing ? "Update Product" : "Add Product"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Fill in product details, pricing, and media.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="dash-card min-w-0 overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 sm:px-6">
              <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">Details</p>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <FormSection>
                <div className="space-y-4">
                  <SectionTitle>Basic Information</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="title-bn" className={labelClass}>
                        পণ্যের নাম <span className="text-red-500">*</span>
                      </label>
                      <input id="title-bn" {...titleBnField} className={inputClass} />
                      <FieldError message={errors.title_bn?.message} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="title-en" className={labelClass}>
                        English Title <span className="text-red-500">*</span>
                      </label>
                      <input id="title-en" {...titleEnField} className={inputClass} />
                      <FieldError message={errors.title_en?.message} />
                    </div>
                    <div>
                      <label htmlFor="slug" className={labelClass}>Slug (auto)</label>
                      <input
                        id="slug"
                        {...register("slug")}
                        onChange={(event) => {
                          setSlugEdited(Boolean(event.target.value));
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
                      <label htmlFor="description" className={labelClass}>Description</label>
                      <textarea id="description" rows={4} {...register("description")} className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection>
                <div className="space-y-4">
                  <SectionTitle>Product Type</SectionTitle>
                  <input type="hidden" {...register("product_type")} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProductTypeOption
                      active={productType === PRODUCT_TYPES.REGULAR}
                      title="Regular Product"
                      description="Single price and stock for the whole product."
                      onClick={() => handleProductTypeChange(PRODUCT_TYPES.REGULAR)}
                    />
                    <ProductTypeOption
                      active={productType === PRODUCT_TYPES.VARIABLE}
                      title="Variable Product"
                      description="Different price and stock per variant."
                      onClick={() => handleProductTypeChange(PRODUCT_TYPES.VARIABLE)}
                    />
                  </div>
                </div>
              </FormSection>

              {!isVariable ? (
                <FormSection>
                  <div className="space-y-4">
                    <SectionTitle>Pricing & Inventory</SectionTitle>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        <div className="flex h-[42px] items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
                          {discountPreview > 0 ? `${discountPreview}% OFF` : "—"}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="quantity" className={labelClass}>Stock Quantity</label>
                        <input
                          id="quantity"
                          type="number"
                          min="0"
                          disabled={stockStatus !== "stock"}
                          {...register("quantity")}
                          className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
                        />
                      </div>
                      <div>
                        <label htmlFor="stock-status" className={labelClass}>Stock Status</label>
                        <select id="stock-status" {...register("stock_status")} className={inputClass}>
                          {VARIANT_STOCK_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </FormSection>
              ) : (
                <FormSection>
                  <div className="space-y-4">
                    <SectionTitle
                      action={
                        <Link
                          href="/dashboard/products/attributes"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Manage attributes →
                        </Link>
                      }
                    >
                      Variable Pricing & Inventory
                    </SectionTitle>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="variant-type" className={labelClass}>
                          Attribute <span className="text-red-500">*</span>
                        </label>
                        <select id="variant-type" {...register("variant_type", { required: isVariable })} className={inputClass}>
                          <option value="">Select attribute</option>
                          {productAttributes.map((attribute) => (
                            <option key={attribute._id} value={attribute.slug}>
                              {attribute.name} ({attribute.name_bn})
                            </option>
                          ))}
                        </select>
                        {!productAttributes.length ? (
                          <p className="mt-1 text-xs text-amber-600">
                            No attributes yet.{" "}
                            <Link href="/dashboard/products/attributes" className="font-semibold underline">
                              Create one
                            </Link>
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label htmlFor="variant-options" className={labelClass}>
                          {selectedAttribute?.name || "Variant"} Options <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="variant-options"
                          {...register("variant_options", {
                            validate: (value) => {
                              if (!isVariable) return true;
                              return value.trim().length > 0 || "Add comma separated options.";
                            },
                          })}
                          placeholder={selectedAttribute?.placeholder || "Option 1, Option 2"}
                          disabled={!variantType}
                          className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50`}
                        />
                        <FieldError message={errors.variant_options?.message} />
                        <p className="mt-1 text-[11px] text-dash-muted">Comma separated values</p>
                      </div>
                    </div>

                    {variantStock.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="min-w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/90">
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Variant</th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Regular</th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sale</th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Discount</th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variantStock.map((entry) => (
                              <tr key={entry.option}>
                                <td className="px-3 py-3 font-semibold text-dash-text">{entry.option}</td>
                                <td className="px-3 py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={entry.regular_price ?? ""}
                                    onChange={(event) =>
                                      updateVariantEntry(entry.option, { regular_price: event.target.value })
                                    }
                                    className={inputClass}
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={entry.sale_price ?? ""}
                                    onChange={(event) =>
                                      updateVariantEntry(entry.option, { sale_price: event.target.value })
                                    }
                                    className={inputClass}
                                  />
                                </td>
                                <td className="px-3 py-3">
                                  <VariantDiscount regularPrice={entry.regular_price} salePrice={entry.sale_price} />
                                </td>
                                <td className="px-3 py-3">
                                  <select
                                    value={entry.stock_status}
                                    onChange={(event) => {
                                      const nextStatus = event.target.value;
                                      updateVariantEntry(entry.option, {
                                        stock_status: nextStatus,
                                        quantity: nextStatus === "stock" ? entry.quantity || 0 : 0,
                                      });
                                    }}
                                    className={inputClass}
                                  >
                                    {VARIANT_STOCK_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-3">
                                  {entry.stock_status === "stock" ? (
                                    <input
                                      type="number"
                                      min="0"
                                      value={entry.quantity}
                                      onChange={(event) =>
                                        updateVariantEntry(entry.option, {
                                          quantity: Math.max(0, Number(event.target.value) || 0),
                                        })
                                      }
                                      className={inputClass}
                                    />
                                  ) : (
                                    <span className="text-xs text-dash-muted">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                        Select an attribute and add options to configure per-variant pricing.
                      </p>
                    )}
                  </div>
                </FormSection>
              )}

              {submitError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{submitError}</p>
              ) : null}
            </div>
          </div>

          <aside className="dash-card self-start overflow-hidden lg:sticky lg:top-[88px]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 sm:px-6">
              <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">Media & Organization</p>
            </div>
            <div className="p-5 sm:p-6">
              <ProductImagesPanel
                existingImages={existingImages}
                imagePreviews={imagePreviews}
                onUploadClick={() => fileInputRef.current?.click()}
                onRemoveExisting={removeExistingImage}
                onRemoveNew={removeNewImage}
              />

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                <SectionTitle>Organization</SectionTitle>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="category" className={labelClass}>
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <select id="category" {...categoryField} className={inputClass}>
                      <option value="">Select category</option>
                      {categories.map((item) => (
                        <option key={item._id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                    <FieldError message={errors.category?.message} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-indigo-500" />
                        Tags
                      </span>
                    </label>
                    <TagsInput tags={tags} onChange={setTags} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="rating" className={labelClass}>
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          Rating
                        </span>
                      </label>
                      <input id="rating" type="number" min="0" max="5" step="0.1" {...register("average_rating")} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="reviews" className={labelClass}>Reviews</label>
                      <input id="reviews" type="number" min="0" {...register("total_reviews")} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="dash-card flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center rounded-lg border border-dash-border bg-white px-4 py-2.5 text-sm font-semibold text-dash-muted transition-colors hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
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
          </button>
        </div>
      </form>
    </div>
  );
}
