"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Pencil, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import { FieldError } from "@/components/dashboard/DashboardFormUi";
import DashPageHeader from "@/components/dashboard/DashPageHeader";
import { slugify } from "@/lib/slugify";
import {
  useCreateProductAttribute,
  useDeleteProductAttribute,
  useProductAttributes,
  useUpdateProductAttribute,
} from "@/hooks/useProductAttributes";
import {
  DesktopTable,
  MobileCardList,
  MobileDashCard,
  MobileDashRow,
  mobileDashModalClass,
} from "@/components/shared/ResponsiveTable";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-dash-text";

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
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            className={`${mobileDashModalClass} sm:max-w-lg`}
          >
            <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
              <h2 className="text-lg font-bold text-dash-text">
                {isEditing ? "Edit Attribute" : "New Attribute"}
              </h2>
              <button type="button" onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-md text-dash-muted hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
              <div>
                <label className={labelClass}>Name (English) *</label>
                <input
                  {...register("name", { required: "Name is required." })}
                  placeholder="Size, Color, Weight..."
                  className={inputClass}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <label className={labelClass}>Name (Bangla)</label>
                <input {...register("name_bn")} placeholder="সাইজ, রং, ওজন..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  {...register("slug")}
                  onChange={(event) => {
                    setSlugEdited(Boolean(event.target.value));
                    setValue("slug", event.target.value);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Option Placeholder</label>
                <input
                  {...register("placeholder")}
                  placeholder="S, M, L, XL"
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-dash-muted">Hint shown when adding product variants</p>
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input type="number" min="0" {...register("sort_order")} className={inputClass} />
              </div>

              {submitError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="rounded-md border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-muted">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
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

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="Catalog"
        title="Product Attributes"
        description="Create variation types like Size, Weight, Color — used in variable products."
        action={
          <button
            type="button"
            onClick={() => {
              setEditingAttribute(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Attribute
          </button>
        }
      />

      {isLoading ? (
        <div className="dash-card flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error?.message || "Failed to load attributes."}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
            Try again
          </button>
        </div>
      ) : attributes.length === 0 ? (
        <div className="dash-card flex min-h-[240px] flex-col items-center justify-center p-10 text-center">
          <SlidersHorizontal className="mb-4 h-10 w-10 text-indigo-600" />
          <h2 className="text-lg font-bold text-dash-text">No attributes yet</h2>
          <p className="mt-2 text-sm text-dash-muted">Create Size, Color, Weight or any custom variation type.</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <MobileCardList className="space-y-0 divide-y divide-dash-border p-0 lg:hidden">
            {attributes.map((attribute) => (
              <div key={attribute._id} className="p-3.5">
                <MobileDashCard className="border-0 p-0 shadow-none">
                  <p className="font-semibold text-dash-text">{attribute.name}</p>
                  <p className="text-xs text-slate-500">{attribute.name_bn}</p>
                  <div className="mt-3 space-y-2 border-t border-dash-border pt-3">
                    <MobileDashRow label="Slug" value={attribute.slug} />
                    <MobileDashRow label="Placeholder" value={attribute.placeholder || "—"} />
                  </div>
                  <div className="mt-3 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAttribute(attribute);
                        setModalOpen(true);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(attribute)}
                      disabled={isDeleting && deletingId === attribute._id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      {isDeleting && deletingId === attribute._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </MobileDashCard>
              </div>
            ))}
          </MobileCardList>

          <DesktopTable>
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-dash-border bg-slate-50/90">
                  <th className="px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Bangla</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Slug</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Placeholder</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attributes.map((attribute) => (
                  <tr key={attribute._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-2.5 font-medium text-dash-text">{attribute.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{attribute.name_bn}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-indigo-600">{attribute.slug}</td>
                    <td className="px-4 py-2.5 text-slate-500">{attribute.placeholder || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAttribute(attribute);
                            setModalOpen(true);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(attribute)}
                          disabled={isDeleting && deletingId === attribute._id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          {isDeleting && deletingId === attribute._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DesktopTable>
        </div>
      )}

      <AttributeFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAttribute(null);
        }}
        attribute={editingAttribute}
      />
    </div>
  );
}
