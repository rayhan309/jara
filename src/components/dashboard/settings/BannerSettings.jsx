"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { DEFAULT_SETTINGS } from "@/lib/siteSettings";
import { createHeroBanner } from "@/lib/heroBanners";
import { uploadHeroBanner } from "@/lib/api/settings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import {
  settingsDashedEmptySx,
  settingsNestedSx,
  settingsPaperSx,
  textFieldSize,
} from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

export default function BannerSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const bannerInputRef = useRef(null);
  const [heroBanners, setHeroBanners] = useState(DEFAULT_SETTINGS.heroBanners);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setHeroBanners(settings.heroBanners || DEFAULT_SETTINGS.heroBanners);
  }, [settings]);

  async function handleBannerUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploadingBanner(true);

    try {
      const image = await uploadHeroBanner(file);
      setHeroBanners((current) => [...current, createHeroBanner(image)]);
      toast.success("Banner added — click Save to apply");
    } catch (uploadError) {
      toast.error(uploadError.message || "Banner upload failed");
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  function handleBannerChange(id, field, value) {
    setHeroBanners((current) =>
      current.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner))
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    save({
      heroBanners: heroBanners.map((banner) => ({
        ...banner,
        alt: banner.alt.trim(),
        href: banner.href.trim() || "/products",
        enabled: Boolean(banner.enabled),
      })),
    });
  }

  return (
    <SettingsPageShell
      title="Hero Banners"
      description="Add or remove homepage banners. If none are set, the storefront shows the default image."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <Paper elevation={0} sx={settingsPaperSx}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "flex-start" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Home Hero Banners
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage homepage slider images.
            </Typography>
          </Box>
          <Box>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              hidden
            />
            <Button
              type="button"
              variant="outlined"
              disabled={isUploadingBanner || isPending}
              startIcon={
                isUploadingBanner ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AddPhotoAlternateOutlinedIcon />
                )
              }
              onClick={() => bannerInputRef.current?.click()}
            >
              Add Banner
            </Button>
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ mt: 2.5 }}>
          {heroBanners.length === 0 ? (
            <Box sx={settingsDashedEmptySx}>
              <Typography variant="body2" color="text.secondary">
                No banners yet. Click Add Banner, or the storefront will use the default banner.
              </Typography>
            </Box>
          ) : (
            heroBanners.map((banner, index) => (
              <Paper
                key={banner.id}
                elevation={0}
                sx={{
                  ...settingsNestedSx,
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "180px 1fr auto" },
                  alignItems: { sm: "flex-start" },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "1170 / 880",
                    overflow: "hidden",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Image
                    src={banner.image.url}
                    alt={banner.alt || `Banner ${index + 1}`}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <TextField
                    label="Alt text"
                    size={textFieldSize}
                    fullWidth
                    value={banner.alt}
                    onChange={(event) => handleBannerChange(banner.id, "alt", event.target.value)}
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                  />
                  <TextField
                    label="Link URL"
                    size={textFieldSize}
                    fullWidth
                    value={banner.href}
                    onChange={(event) => handleBannerChange(banner.id, "href", event.target.value)}
                    placeholder="/products"
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={banner.enabled}
                        onChange={(event) =>
                          handleBannerChange(banner.id, "enabled", event.target.checked)
                        }
                      />
                    }
                    label="Show on homepage"
                    sx={{
                      m: 0,
                      px: 1.5,
                      py: 0.5,
                      width: "fit-content",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      gridColumn: { sm: "1 / -1" },
                    }}
                  />
                </Box>

                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                  onClick={() =>
                    setHeroBanners((current) => current.filter((entry) => entry.id !== banner.id))
                  }
                  sx={{ alignSelf: "flex-start" }}
                >
                  Remove
                </Button>
              </Paper>
            ))
          )}
        </Stack>
      </Paper>
    </SettingsPageShell>
  );
}
