"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import { inputClass } from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

function createDeliveryArea() {
  return {
    id: `area-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: "",
  };
}

function createShippingClass(deliveryAreas) {
  const charges = deliveryAreas.reduce((acc, area) => {
    acc[area.id] = 0;
    return acc;
  }, {});

  return {
    id: `shipping-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    description: "",
    freeDelivery: false,
    charges,
  };
}

function normalizeCharges(charges, deliveryAreas) {
  return deliveryAreas.reduce((acc, area) => {
    acc[area.id] = Math.max(0, Number(charges?.[area.id]) || 0);
    return acc;
  }, {});
}

export default function ShippingSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const [deliveryAreas, setDeliveryAreas] = useState(DEFAULT_SETTINGS.deliveryAreas);
  const [shippingClasses, setShippingClasses] = useState(DEFAULT_SETTINGS.shippingClasses);

  useEffect(() => {
    if (!settings) return;
    setDeliveryAreas(settings.deliveryAreas || DEFAULT_SETTINGS.deliveryAreas);
    setShippingClasses(settings.shippingClasses || DEFAULT_SETTINGS.shippingClasses);
  }, [settings]);

  useEffect(() => {
    setShippingClasses((current) =>
      current.map((entry) => ({
        ...entry,
        charges: normalizeCharges(entry.charges, deliveryAreas),
      }))
    );
  }, [deliveryAreas]);

  const canRemoveAreas = deliveryAreas.length > 1;
  const canRemoveClasses = shippingClasses.length > 1;

  function handleSave(event) {
    event.preventDefault();

    const invalidArea = deliveryAreas.find((area) => !area.label.trim());
    if (invalidArea) {
      toast.error("সব ডেলিভারি এরিয়ার নাম দিন");
      return;
    }

    const invalidClass = shippingClasses.find((entry) => !entry.name.trim());
    if (invalidClass) {
      toast.error("সব শিপিং ক্লাসের নাম দিন");
      return;
    }

    const nextAreas = deliveryAreas.map((area) => ({
      ...area,
      label: area.label.trim(),
    }));

    const nextClasses = shippingClasses.map((entry) => ({
      ...entry,
      name: entry.name.trim(),
      description: entry.description.trim(),
      freeDelivery: Boolean(entry.freeDelivery),
      charges: normalizeCharges(entry.charges, nextAreas),
    }));

    save(
      {
        deliveryAreas: nextAreas,
        shippingClasses: nextClasses,
      },
      { successMessage: "Shipping settings saved" }
    );
  }

  const deliveryAreaLookup = useMemo(
    () =>
      deliveryAreas.reduce((acc, area) => {
        acc[area.id] = area.label || "Area";
        return acc;
      }, {}),
    [deliveryAreas]
  );

  return (
    <SettingsPageShell
      title="Shipping"
      description="Delivery area ar shipping class charge manage korun."
      onSubmit={handleSave}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <section className="dash-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Delivery Areas</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Checkout-এর delivery options এখানে control হবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeliveryAreas((current) => [...current, createDeliveryArea()])}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Area
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {deliveryAreas.map((area) => (
              <div
                key={area.id}
                className="rounded-md border border-dash-border bg-slate-50/70 p-3"
              >
                <label className="mb-1 block text-xs font-semibold text-dash-muted">Area Name</label>
                <div className="flex items-center gap-2">
                  <input
                    value={area.label}
                    onChange={(event) =>
                      setDeliveryAreas((current) =>
                        current.map((entry) =>
                          entry.id === area.id ? { ...entry, label: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="ঢাকার ভিতরে"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryAreas((current) => current.filter((entry) => entry.id !== area.id))
                    }
                    disabled={!canRemoveAreas}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove area"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-dash-text">Shipping Classes</h2>
              <p className="mt-1 text-sm text-dash-muted">
                Product-wise shipping charge set করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setShippingClasses((current) => [...current, createShippingClass(deliveryAreas)])
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Class
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {shippingClasses.map((entry) => (
              <div
                key={entry.id}
                className="rounded-md border border-dash-border bg-slate-50/70 p-4"
              >
                <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_auto] md:items-end">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-dash-muted">Class Name</label>
                    <input
                      value={entry.name}
                      onChange={(event) =>
                        setShippingClasses((current) =>
                          current.map((item) =>
                            item.id === entry.id ? { ...item, name: event.target.value } : item
                          )
                        )
                      }
                      placeholder="Standard"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-dash-muted">Description</label>
                    <input
                      value={entry.description}
                      onChange={(event) =>
                        setShippingClasses((current) =>
                          current.map((item) =>
                            item.id === entry.id
                              ? { ...item, description: event.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="Optional note"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md border border-dash-border bg-white px-3 py-2.5 text-xs font-semibold text-dash-text">
                      <input
                        type="checkbox"
                        checked={entry.freeDelivery}
                        onChange={(event) =>
                          setShippingClasses((current) =>
                            current.map((item) =>
                              item.id === entry.id
                                ? { ...item, freeDelivery: event.target.checked }
                                : item
                            )
                          )
                        }
                        className="h-4 w-4 accent-indigo-600"
                      />
                      Free Delivery
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShippingClasses((current) =>
                          current.filter((item) => item.id !== entry.id)
                        )
                      }
                      disabled={!canRemoveClasses}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Remove class"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {deliveryAreas.map((area) => (
                    <div key={`${entry.id}-${area.id}`}>
                      <label className="mb-1 block text-xs font-semibold text-dash-muted">
                        {deliveryAreaLookup[area.id]}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={entry.charges?.[area.id] ?? 0}
                        onChange={(event) =>
                          setShippingClasses((current) =>
                            current.map((item) =>
                              item.id === entry.id
                                ? {
                                    ...item,
                                    charges: {
                                      ...item.charges,
                                      [area.id]: event.target.value,
                                    },
                                  }
                                : item
                            )
                          )
                        }
                        disabled={entry.freeDelivery}
                        className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-400`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SettingsPageShell>
  );
}
