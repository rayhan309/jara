"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import {
  settingsNestedSx,
  settingsPaperSx,
  textFieldSize,
} from "@/components/dashboard/settings/settingsShared";
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
      toast.error("Enter a name for every delivery area");
      return;
    }

    const invalidClass = shippingClasses.find((entry) => !entry.name.trim());
    if (invalidClass) {
      toast.error("Enter a name for every shipping class");
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
      description="Manage delivery areas and shipping class charges."
      onSubmit={handleSave}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1.9fr" },
        }}
      >
        <Paper elevation={0} sx={settingsPaperSx}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Delivery Areas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Controls delivery options shown at checkout.
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDeliveryAreas((current) => [...current, createDeliveryArea()])}
              sx={{ flexShrink: 0 }}
            >
              Add Area
            </Button>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            {deliveryAreas.map((area) => (
              <Paper key={area.id} elevation={0} sx={settingsNestedSx}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Area Name"
                    size={textFieldSize}
                    fullWidth
                    value={area.label}
                    onChange={(event) =>
                      setDeliveryAreas((current) =>
                        current.map((entry) =>
                          entry.id === area.id ? { ...entry, label: event.target.value } : entry
                        )
                      )
                    }
                    placeholder="Inside Dhaka"
                  />
                  <IconButton
                    type="button"
                    color="error"
                    disabled={!canRemoveAreas}
                    aria-label="Remove area"
                    onClick={() =>
                      setDeliveryAreas((current) => current.filter((entry) => entry.id !== area.id))
                    }
                    sx={{
                      border: 1,
                      borderColor: "error.light",
                      borderRadius: 1,
                      bgcolor: "error.50",
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={settingsPaperSx}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Shipping Classes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Set product-wise shipping charges.
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                setShippingClasses((current) => [...current, createShippingClass(deliveryAreas)])
              }
              sx={{ flexShrink: 0 }}
            >
              Add Class
            </Button>
          </Stack>

          <Stack spacing={2} sx={{ mt: 2.5 }}>
            {shippingClasses.map((entry) => (
              <Paper key={entry.id} elevation={0} sx={settingsNestedSx}>
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr auto" },
                    alignItems: { md: "end" },
                  }}
                >
                  <TextField
                    label="Class Name"
                    size={textFieldSize}
                    fullWidth
                    value={entry.name}
                    onChange={(event) =>
                      setShippingClasses((current) =>
                        current.map((item) =>
                          item.id === entry.id ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    placeholder="Standard"
                  />
                  <TextField
                    label="Description"
                    size={textFieldSize}
                    fullWidth
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
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
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
                        />
                      }
                      label="Free Delivery"
                      sx={{
                        m: 0,
                        px: 1,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "background.paper",
                      }}
                    />
                    <IconButton
                      type="button"
                      color="error"
                      disabled={!canRemoveClasses}
                      aria-label="Remove class"
                      onClick={() =>
                        setShippingClasses((current) =>
                          current.filter((item) => item.id !== entry.id)
                        )
                      }
                      sx={{
                        border: 1,
                        borderColor: "error.light",
                        borderRadius: 1,
                        bgcolor: "error.50",
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  {deliveryAreas.map((area) => (
                    <TextField
                      key={`${entry.id}-${area.id}`}
                      label={deliveryAreaLookup[area.id]}
                      size={textFieldSize}
                      fullWidth
                      type="number"
                      slotProps={{
                        htmlInput: { min: 0 },
                        input: {
                          startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                        },
                      }}
                      value={entry.charges?.[area.id] ?? 0}
                      disabled={entry.freeDelivery}
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
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>
    </SettingsPageShell>
  );
}
