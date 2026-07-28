"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
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
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useProductAttributes } from "@/hooks/useProductAttributes";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";

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
  shipping_class: "",
  average_rating: "0",
  total_reviews: "0",
};

function SectionTitle({ children, action }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.5}
      sx={{ pb: 1.5, borderBottom: 1, borderColor: "divider" }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
      >
        {children}
      </Typography>
      {action}
    </Stack>
  );
}

function FormSection({ children }) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: "divider", bgcolor: "grey.50" }}>
      {children}
    </Paper>
  );
}

function ProductTypeOption({ active, title, description, onClick }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        justifyContent: "flex-start",
        textAlign: "left",
        flexDirection: "column",
        alignItems: "flex-start",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: active ? "primary.50" : "background.paper",
        boxShadow: active ? 1 : 0,
      }}
    >
      <Typography variant="body2" fontWeight={700} color={active ? "primary.main" : "text.primary"}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, whiteSpace: "normal" }}>
        {description}
      </Typography>
    </Button>
  );
}

function VariantDiscount({ regularPrice, salePrice }) {
  const discount = calculateDiscountPercentage(regularPrice, salePrice);
  return (
    <Chip
      size="small"
      color={discount > 0 ? "success" : "default"}
      variant="outlined"
      label={discount > 0 ? `${discount}% OFF` : "—"}
      sx={{ minHeight: 42, borderRadius: 1 }}
    />
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
    <Stack spacing={1}>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          minHeight: 42,
          px: 1,
          py: 0.75,
          border: 1,
          borderColor: "divider",
        }}
      >
        {tags.map((tag) => (
          <Chip
            key={tag}
            size="small"
            label={tag}
            color="primary"
            variant="outlined"
            onDelete={() => onChange(tags.filter((entry) => entry !== tag))}
            deleteIcon={<CloseRoundedIcon />}
          />
        ))}
        <TextField
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
          variant="standard"
          slotProps={{ input: { disableUnderline: true } }}
          sx={{ minWidth: 120, flex: 1 }}
        />
      </Paper>
      <Typography variant="caption" color="text.secondary">
        Press Enter or comma to add tags
      </Typography>
    </Stack>
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
    <Stack spacing={3}>
      <Box>
        <SectionTitle>Product Image</SectionTitle>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block", lineHeight: 1.6 }}>
          Main image shown in catalog and product page.
        </Typography>
        <Box sx={{ mt: 2 }}>
          {featured ? (
            <Box
              sx={{
                position: "relative",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                bgcolor: "grey.100",
              }}
            >
              <Image src={featured.url} alt="Featured product" fill unoptimized style={{ objectFit: "cover" }} />
              <IconButton
                size="small"
                onClick={() => removeItem(featured)}
                sx={{ position: "absolute", top: 8, right: 8, bgcolor: "background.paper", "&:hover": { bgcolor: "background.paper" } }}
              >
                <CloseRoundedIcon fontSize="small" color="error" />
              </IconButton>
              <Chip
                size="small"
                label="Featured"
                sx={{ position: "absolute", bottom: 8, left: 8, bgcolor: "rgba(0,0,0,0.55)", color: "common.white" }}
              />
            </Box>
          ) : (
            <Button
              type="button"
              onClick={onUploadClick}
              variant="outlined"
              fullWidth
              sx={{
                aspectRatio: "1 / 1",
                borderStyle: "dashed",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <AddPhotoAlternateOutlinedIcon color="primary" />
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Upload main image
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG up to 10MB
              </Typography>
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ pt: 3, borderTop: 1, borderColor: "divider" }}>
        <SectionTitle
          action={
            <Button size="small" onClick={onUploadClick}>
              + Add
            </Button>
          }
        >
          Product Gallery
        </SectionTitle>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block", lineHeight: 1.6 }}>
          Additional photos for the product detail page.
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.25,
          }}
        >
          {gallery.map((item) => (
            <Box
              key={`${item.kind}-${item.index}-${item.url}`}
              sx={{
                position: "relative",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                bgcolor: "grey.100",
              }}
            >
              <Image src={item.url} alt="" fill unoptimized style={{ objectFit: "cover" }} />
              <IconButton
                size="small"
                onClick={() => removeItem(item)}
                sx={{ position: "absolute", top: 6, right: 6, bgcolor: "background.paper", "&:hover": { bgcolor: "background.paper" } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 16 }} color="error" />
              </IconButton>
            </Box>
          ))}
          <Button
            type="button"
            onClick={onUploadClick}
            variant="outlined"
            sx={{
              borderStyle: "dashed",
              flexDirection: "column",
              gap: 0.5,
              aspectRatio: gallery.length ? "1 / 1" : "auto",
              gridColumn: gallery.length ? "auto" : "1 / -1",
              minHeight: gallery.length ? undefined : 108,
            }}
          >
            <AddPhotoAlternateOutlinedIcon fontSize="small" />
            <Typography variant="caption" fontWeight={600}>
              Add gallery images
            </Typography>
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}

export default function ProductForm({ product = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: productAttributes = [] } = useProductAttributes();
  const { data: siteSettings } = useSiteSettings();
  const shippingClasses = siteSettings?.shippingClasses || [];
  const defaultShippingClass = shippingClasses[0]?.id || "";
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
  const shippingClassValue = watch("shipping_class");
  const quantity = watch("quantity");
  const titleEnValue = watch("title_en");
  const titleBnValue = watch("title_bn");
  const categoryValue = watch("category");
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

  const titleBnField = register("title_bn", { required: "Title (BN) is required." });
  const titleEnField = register("title_en", { required: "Title (EN) is required." });
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
    reset({ ...emptyValues, shipping_class: defaultShippingClass });
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
    formData.append("shipping_class", values.shipping_class || defaultShippingClass);

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
      shipping_class: product.attributes?.shipping_class || defaultShippingClass,
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
      mergeVariantStockWithOptions(options, product.inventory?.variant_stock || [], {
        ...product.inventory,
        regular_price: product.pricing?.regular_price ?? "",
        sale_price: product.pricing?.sale_price ?? "",
      })
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [product, reset]);

  useEffect(() => {
    if (product) return;
    if (!defaultShippingClass) return;
    if (!shippingClassValue) {
      setValue("shipping_class", defaultShippingClass);
    }
  }, [defaultShippingClass, product, setValue, shippingClassValue]);

  useEffect(() => {
    if (!isVariable || !variantType) {
      setVariantStock([]);
      return;
    }
    if (!parsedVariantOptions.length) {
      setVariantStock([]);
      return;
    }
    setVariantStock((current) =>
      mergeVariantStockWithOptions(parsedVariantOptions, current, {
        stock_status: stockStatus,
        quantity,
        regular_price: regularPrice,
        sale_price: salePrice,
      })
    );
  }, [isVariable, variantType, parsedVariantOptions.join("|"), stockStatus, quantity, regularPrice, salePrice]);

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
      return;
    }

    const options = parseVariantOptions(variantOptionsValue);
    if (options.length && variantType) {
      setVariantStock((current) =>
        mergeVariantStockWithOptions(options, current, {
          stock_status: stockStatus,
          quantity,
          regular_price: regularPrice,
          sale_price: salePrice,
        })
      );
    }
  }

  return (
    <Box sx={{ mx: "auto", maxWidth: 1280 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <IconButton
            component={Link}
            href="/dashboard/products"
            aria-label="Back to products"
            sx={{ mt: 0.5, border: 1, borderColor: "divider" }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="primary"
              sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
            >
              {isEditing ? "Edit Product" : "New Product"}
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {isEditing ? "Update Product" : "Add Product"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Fill in product details, pricing, and media.
            </Typography>
          </Box>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            hidden
          />

          <Box
            sx={{
              display: "grid",
              gap: 3,
              alignItems: "start",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
            }}
          >
            <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider", minWidth: 0 }}>
              <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
                >
                  Details
                </Typography>
              </Box>

              <Stack spacing={2.5} sx={{ p: { xs: 2.5, sm: 3 } }}>
                <FormSection>
                  <Stack spacing={2}>
                    <SectionTitle>Basic Information</SectionTitle>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      }}
                    >
                      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                        <TextField
                          id="title-bn"
                          fullWidth
                          label="Title (BN)"
                          required
                          {...titleBnField}
                          error={Boolean(errors.title_bn)}
                        />
                        <FieldError message={errors.title_bn?.message} />
                      </Box>
                      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                        <TextField
                          id="title-en"
                          fullWidth
                          label="Title (EN)"
                          required
                          {...titleEnField}
                          error={Boolean(errors.title_en)}
                        />
                        <FieldError message={errors.title_en?.message} />
                      </Box>
                      <TextField
                        id="slug"
                        fullWidth
                        label="Slug (auto)"
                        {...register("slug")}
                        onChange={(event) => {
                          setSlugEdited(Boolean(event.target.value));
                          setValue("slug", event.target.value);
                        }}
                      />
                      <TextField
                        id="brand"
                        fullWidth
                        label="Brand / Vendor"
                        {...register("brand_or_vendor")}
                      />
                      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                        <TextField
                          id="description"
                          fullWidth
                          multiline
                          minRows={4}
                          label="Description"
                          {...register("description")}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </FormSection>

                <FormSection>
                  <Stack spacing={2}>
                    <SectionTitle>Product Type</SectionTitle>
                    <input type="hidden" {...register("product_type")} />
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      }}
                    >
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
                    </Box>
                  </Stack>
                </FormSection>

                {!isVariable ? (
                  <FormSection>
                    <Stack spacing={2}>
                      <SectionTitle>Pricing & Inventory</SectionTitle>
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                        }}
                      >
                        <Box>
                          <TextField
                            id="regular-price"
                            fullWidth
                            type="number"
                            label="Regular Price (৳)"
                            required
                            slotProps={{ htmlInput: { min: 1 } }}
                            {...regularPriceField}
                            error={Boolean(errors.regular_price)}
                          />
                          <FieldError message={errors.regular_price?.message} />
                        </Box>
                        <Box>
                          <TextField
                            id="sale-price"
                            fullWidth
                            type="number"
                            label="Sale Price (৳)"
                            required
                            slotProps={{ htmlInput: { min: 1 } }}
                            {...salePriceField}
                            error={Boolean(errors.sale_price)}
                          />
                          <FieldError message={errors.sale_price?.message} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                            Discount
                          </Typography>
                          <Chip
                            color={discountPreview > 0 ? "success" : "default"}
                            variant="outlined"
                            label={discountPreview > 0 ? `${discountPreview}% OFF` : "—"}
                            sx={{ height: 40, width: "100%", borderRadius: 1 }}
                          />
                        </Box>
                        <TextField
                          id="quantity"
                          fullWidth
                          type="number"
                          label="Stock Quantity"
                          slotProps={{ htmlInput: { min: 0 } }}
                          disabled={stockStatus !== "stock"}
                          {...register("quantity")}
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel id="stock-status-label">Stock Status</InputLabel>
                          <Select
                            labelId="stock-status-label"
                            id="stock-status"
                            label="Stock Status"
                            value={stockStatus || "in_stock"}
                            onChange={(event) => setValue("stock_status", event.target.value)}
                          >
                            {VARIANT_STOCK_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack>
                  </FormSection>
                ) : (
                  <FormSection>
                    <Stack spacing={2}>
                      <SectionTitle
                        action={
                          <Button component={Link} href="/dashboard/products/attributes" size="small">
                            Manage attributes →
                          </Button>
                        }
                      >
                        Variable Pricing & Inventory
                      </SectionTitle>

                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        }}
                      >
                        <Box>
                          <FormControl fullWidth size="small" required>
                            <InputLabel id="variant-type-label">Attribute</InputLabel>
                            <Select
                              labelId="variant-type-label"
                              id="variant-type"
                              label="Attribute"
                              value={variantType || ""}
                              onChange={(event) => setValue("variant_type", event.target.value, { shouldValidate: true })}
                            >
                              <MenuItem value="">
                                <em>Select attribute</em>
                              </MenuItem>
                              {productAttributes.map((attribute) => (
                                <MenuItem key={attribute._id} value={attribute.slug}>
                                  {attribute.name} ({attribute.name_bn})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {!productAttributes.length ? (
                            <Typography variant="caption" color="warning.main" sx={{ mt: 0.75, display: "block" }}>
                              No attributes yet.{" "}
                              <Box component={Link} href="/dashboard/products/attributes" sx={{ fontWeight: 700, textDecoration: "underline", color: "inherit" }}>
                                Create one
                              </Box>
                            </Typography>
                          ) : null}
                        </Box>
                        <Box>
                          <TextField
                            id="variant-options"
                            fullWidth
                            required
                            label={`${selectedAttribute?.name || "Variant"} Options`}
                            placeholder={selectedAttribute?.placeholder || "Option 1, Option 2"}
                            disabled={!variantType}
                            {...register("variant_options", {
                              validate: (value) => {
                                if (!isVariable) return true;
                                return value.trim().length > 0 || "Add comma separated options.";
                              },
                            })}
                            error={Boolean(errors.variant_options)}
                          />
                          <FieldError message={errors.variant_options?.message} />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            Comma separated values
                          </Typography>
                        </Box>
                      </Box>

                      {variantStock.length > 0 ? (
                        <Paper elevation={0} sx={{ overflowX: "auto", border: 1, borderColor: "divider" }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Variant</TableCell>
                                <TableCell>Regular</TableCell>
                                <TableCell>Sale</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Qty</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {variantStock.map((entry) => (
                                <TableRow key={entry.option}>
                                  <TableCell sx={{ fontWeight: 700 }}>{entry.option}</TableCell>
                                  <TableCell>
                                    <TextField
                                      type="number"
                                      size="small"
                                      slotProps={{ htmlInput: { min: 1 } }}
                                      value={entry.regular_price ?? ""}
                                      onChange={(event) =>
                                        updateVariantEntry(entry.option, { regular_price: event.target.value })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      type="number"
                                      size="small"
                                      slotProps={{ htmlInput: { min: 1 } }}
                                      value={entry.sale_price ?? ""}
                                      onChange={(event) =>
                                        updateVariantEntry(entry.option, { sale_price: event.target.value })
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <VariantDiscount regularPrice={entry.regular_price} salePrice={entry.sale_price} />
                                  </TableCell>
                                  <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                      <Select
                                        value={entry.stock_status}
                                        onChange={(event) => {
                                          const nextStatus = event.target.value;
                                          updateVariantEntry(entry.option, {
                                            stock_status: nextStatus,
                                            quantity: nextStatus === "stock" ? entry.quantity || 0 : 0,
                                          });
                                        }}
                                      >
                                        {VARIANT_STOCK_OPTIONS.map((option) => (
                                          <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>
                                  <TableCell>
                                    {entry.stock_status === "stock" ? (
                                      <TextField
                                        type="number"
                                        size="small"
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        value={entry.quantity}
                                        onChange={(event) =>
                                          updateVariantEntry(entry.option, {
                                            quantity: Math.max(0, Number(event.target.value) || 0),
                                          })
                                        }
                                      />
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 4,
                            textAlign: "center",
                            border: 1,
                            borderStyle: "dashed",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Select an attribute and add options to configure per-variant pricing.
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </FormSection>
                )}

                {submitError ? <Alert severity="error">{submitError}</Alert> : null}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                overflow: "hidden",
                border: 1,
                borderColor: "divider",
                alignSelf: "start",
                position: { lg: "sticky" },
                top: { lg: 88 },
              }}
            >
              <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 1.75, borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
                >
                  Media & Organization
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
                <ProductImagesPanel
                  existingImages={existingImages}
                  imagePreviews={imagePreviews}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onRemoveExisting={removeExistingImage}
                  onRemoveNew={removeNewImage}
                />

                <Stack spacing={2} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
                  <SectionTitle>Organization</SectionTitle>
                  <Box>
                    <FormControl fullWidth size="small" required error={Boolean(errors.category)}>
                      <InputLabel id="category-label">Select Category</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        label="Select Category"
                        value={categoryValue || ""}
                        onChange={(event) => {
                          categoryField.onChange(event);
                          setValue("category", event.target.value, { shouldValidate: true });
                        }}
                        inputRef={categoryField.ref}
                        name={categoryField.name}
                        onBlur={categoryField.onBlur}
                      >
                        <MenuItem value="">
                          <em>Select category</em>
                        </MenuItem>
                        {categories.map((item) => (
                          <MenuItem key={item._id} value={item.name}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FieldError message={errors.category?.message} />
                  </Box>

                  <FormControl fullWidth size="small">
                    <InputLabel id="shipping-class-label">Shipping Class</InputLabel>
                    <Select
                      labelId="shipping-class-label"
                      id="shipping-class"
                      label="Shipping Class"
                      value={shippingClassValue || ""}
                      onChange={(event) => setValue("shipping_class", event.target.value)}
                    >
                      {shippingClasses.length === 0 ? (
                        <MenuItem value="">No shipping class</MenuItem>
                      ) : (
                        [
                          <MenuItem key="__empty" value="">
                            Select shipping class
                          </MenuItem>,
                          ...shippingClasses.map((shipping) => (
                            <MenuItem key={shipping.id} value={shipping.id}>
                              {shipping.name}
                            </MenuItem>
                          )),
                        ]
                      )}
                    </Select>
                  </FormControl>

                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                      <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography variant="body2" fontWeight={600}>
                        Tags
                      </Typography>
                    </Stack>
                    <TagsInput tags={tags} onChange={setTags} />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    <TextField
                      id="rating"
                      fullWidth
                      type="number"
                      label="Rating"
                      slotProps={{
                        htmlInput: { min: 0, max: 5, step: 0.1 },
                        input: {
                          startAdornment: (
                            <StarOutlineRoundedIcon sx={{ fontSize: 16, color: "warning.main", mr: 0.5 }} />
                          ),
                        },
                      }}
                      {...register("average_rating")}
                    />
                    <TextField
                      id="reviews"
                      fullWidth
                      type="number"
                      label="Reviews"
                      slotProps={{ htmlInput: { min: 0 } }}
                      {...register("total_reviews")}
                    />
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: 3,
              px: { xs: 2.5, sm: 3 },
              py: 2,
              border: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button component={Link} href="/dashboard/products" color="inherit" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              startIcon={
                isPending ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />
              }
            >
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Product"
                  : "Save Product"}
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
