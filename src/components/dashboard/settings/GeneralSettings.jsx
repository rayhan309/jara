"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  DEFAULT_SETTINGS,
  deriveThemeColors,
  getFaviconUrl,
  getShopLogoUrl,
  normalizeHexColor,
  SOCIAL_PLATFORMS,
} from "@/lib/siteSettings";
import { uploadBrandAsset } from "@/lib/api/settings";
import SettingsPageShell from "@/components/dashboard/settings/SettingsPageShell";
import {
  settingsDashedEmptySx,
  settingsNestedSx,
  settingsPaperSx,
  textFieldSize,
} from "@/components/dashboard/settings/settingsShared";
import { useSettingsEditor } from "@/components/dashboard/settings/useSettingsEditor";

const COLOR_PRESETS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Emerald", value: "#059669" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rose", value: "#e11d48" },
  { label: "Sky", value: "#0284c7" },
  { label: "Violet", value: "#7c3aed" },
];

function createSocialLink(platform = "facebook") {
  const meta = SOCIAL_PLATFORMS.find((item) => item.id === platform) || SOCIAL_PLATFORMS[0];

  return {
    id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platform: meta.id,
    label: meta.label,
    url: "",
    enabled: true,
  };
}

function AssetPreview({ src, emptyLabel }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: 64,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      {src ? (
        <Image src={src} alt="Asset preview" fill sizes="64px" style={{ objectFit: "contain", padding: 4 }} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          {emptyLabel}
        </Typography>
      )}
    </Box>
  );
}

export default function GeneralSettings() {
  const { settings, isLoading, isError, error, refetch, save, isPending } = useSettingsEditor();
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_SETTINGS.primaryColor);
  const [shopShortDescription, setShopShortDescription] = useState(
    DEFAULT_SETTINGS.shopShortDescription
  );
  const [shopTagline, setShopTagline] = useState(DEFAULT_SETTINGS.shopTagline);
  const [copyrightText, setCopyrightText] = useState(DEFAULT_SETTINGS.copyrightText);
  const [shopLogo, setShopLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SETTINGS.socialLinks);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPrimaryColor(settings.primaryColor);
    setShopShortDescription(
      settings.shopShortDescription || DEFAULT_SETTINGS.shopShortDescription
    );
    setShopTagline(settings.shopTagline || DEFAULT_SETTINGS.shopTagline);
    setCopyrightText(settings.copyrightText || DEFAULT_SETTINGS.copyrightText);
    setShopLogo(settings.shopLogo || null);
    setFavicon(settings.favicon || null);
    setSocialLinks(settings.socialLinks || DEFAULT_SETTINGS.socialLinks);
  }, [settings]);

  const previewTheme = deriveThemeColors(normalizeHexColor(primaryColor));

  async function handleAssetUpload(event, type) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const setUploading = type === "logo" ? setIsUploadingLogo : setIsUploadingFavicon;
    const setAsset = type === "logo" ? setShopLogo : setFavicon;

    setUploading(true);

    try {
      const asset = await uploadBrandAsset(file, type);
      setAsset(asset);
      toast.success(
        type === "logo"
          ? "Logo uploaded — click Save to apply"
          : "Favicon uploaded — click Save to apply"
      );
    } catch (uploadError) {
      toast.error(uploadError.message || "Upload failed");
    } finally {
      setUploading(false);
      if (type === "logo" && logoInputRef.current) logoInputRef.current.value = "";
      if (type === "favicon" && faviconInputRef.current) faviconInputRef.current.value = "";
    }
  }

  function handleSocialChange(id, field, value) {
    setSocialLinks((current) =>
      current.map((link) => {
        if (link.id !== id) return link;

        if (field === "platform") {
          const meta = SOCIAL_PLATFORMS.find((item) => item.id === value);
          return {
            ...link,
            platform: value,
            label: meta?.label || link.label,
          };
        }

        return { ...link, [field]: value };
      })
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    const invalidLink = socialLinks.find((link) => link.enabled && !link.url.trim());
    if (invalidLink) {
      toast.error(`Enter a URL for "${invalidLink.label}"`);
      return;
    }

    save({
      primaryColor: normalizeHexColor(primaryColor),
      shopShortDescription: shopShortDescription.trim(),
      shopTagline: shopTagline.trim(),
      copyrightText: copyrightText.trim(),
      shopLogo,
      favicon,
      socialLinks: socialLinks.map((link) => ({
        ...link,
        url: link.url.trim(),
        enabled: Boolean(link.enabled && link.url.trim()),
      })),
    });
  }

  return (
    <SettingsPageShell
      title="General"
      description="Manage logo, favicon, brand color, and footer content."
      onSubmit={handleSubmit}
      isPending={isPending}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
    >
      <Paper elevation={0} sx={settingsPaperSx}>
        <Typography variant="h6" fontWeight={700}>
          Logo & Favicon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Shown in the navbar, footer, and browser tab. Click Save after uploading.
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <Paper elevation={0} sx={settingsNestedSx}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Shop Logo
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <AssetPreview src={getShopLogoUrl({ shopLogo })} emptyLabel="No logo" />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAssetUpload(event, "logo")}
                  hidden
                />
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={isUploadingLogo || isPending}
                  startIcon={
                    isUploadingLogo ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <AddPhotoAlternateOutlinedIcon fontSize="small" />
                    )
                  }
                  onClick={() => logoInputRef.current?.click()}
                >
                  {shopLogo ? "Change Logo" : "Upload Logo"}
                </Button>
                {shopLogo ? (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={isPending}
                    startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                    onClick={() => setShopLogo(null)}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              PNG, JPG, SVG — transparent background preferred.
            </Typography>
          </Paper>

          <Paper elevation={0} sx={settingsNestedSx}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Favicon
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <AssetPreview src={getFaviconUrl({ favicon })} emptyLabel="Default" />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAssetUpload(event, "favicon")}
                  hidden
                />
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={isUploadingFavicon || isPending}
                  startIcon={
                    isUploadingFavicon ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <AddPhotoAlternateOutlinedIcon fontSize="small" />
                    )
                  }
                  onClick={() => faviconInputRef.current?.click()}
                >
                  {favicon ? "Change Favicon" : "Upload Favicon"}
                </Button>
                {favicon ? (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={isPending}
                    startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                    onClick={() => setFavicon(null)}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              32×32 or 64×64 PNG/ICO recommended — browser tab icon.
            </Typography>
          </Paper>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        <Paper elevation={0} sx={settingsPaperSx}>
          <Typography variant="h6" fontWeight={700}>
            Brand Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Updates buttons, navbar, links, and accent colors.
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
            <Box
              component="input"
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              aria-label="Primary color picker"
              sx={{
                width: 48,
                height: 48,
                p: 0.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                cursor: "pointer",
              }}
            />
            <TextField
              size={textFieldSize}
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              placeholder="#4f46e5"
              sx={{ maxWidth: 160, "& input": { fontFamily: "monospace", textTransform: "uppercase" } }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {COLOR_PRESETS.map((preset) => {
              const selected = primaryColor.toLowerCase() === preset.value;
              return (
                <Chip
                  key={preset.value}
                  clickable
                  onClick={() => setPrimaryColor(preset.value)}
                  label={preset.label}
                  variant={selected ? "filled" : "outlined"}
                  color={selected ? "primary" : "default"}
                  icon={
                    <Box
                      component="span"
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: preset.value,
                        border: "1px solid rgba(0,0,0,0.1)",
                        ml: 0.5,
                      }}
                    />
                  }
                />
              );
            })}
          </Stack>

          <Paper elevation={0} sx={{ ...settingsNestedSx, mt: 2.5 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Preview
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: previewTheme.primaryColor,
                  color: "#fff",
                  typography: "caption",
                  fontWeight: 700,
                }}
              >
                Primary Button
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: previewTheme.primaryColorHover,
                  color: "#fff",
                  typography: "caption",
                  fontWeight: 700,
                }}
              >
                Hover
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor: previewTheme.primaryColorBorder,
                  bgcolor: previewTheme.primaryColorSoft,
                  color: previewTheme.primaryColor,
                  typography: "caption",
                  fontWeight: 700,
                }}
              >
                Soft Badge
              </Box>
            </Stack>
          </Paper>
        </Paper>

        <Paper elevation={0} sx={settingsPaperSx}>
          <Typography variant="h6" fontWeight={700}>
            Shop Content
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Edit the footer short description, tagline, and copyright text.
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Short Description"
              size={textFieldSize}
              multiline
              rows={3}
              fullWidth
              value={shopShortDescription}
              onChange={(event) => setShopShortDescription(event.target.value)}
            />
            <TextField
              label="Tagline"
              size={textFieldSize}
              fullWidth
              value={shopTagline}
              onChange={(event) => setShopTagline(event.target.value)}
              placeholder="Built for modern e-commerce"
            />
            <TextField
              label="Copyright Text"
              size={textFieldSize}
              fullWidth
              value={copyrightText}
              onChange={(event) => setCopyrightText(event.target.value)}
              placeholder="© {year} Raisa's Glam Nest. All rights reserved."
              helperText={`Use {year} to insert the current year automatically.`}
            />
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ ...settingsPaperSx, gridColumn: { lg: "1 / -1" } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "flex-start" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Social Links
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Shown in the footer. Links without a URL stay disabled.
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => setSocialLinks((current) => [...current, createSocialLink()])}
              sx={{ flexShrink: 0 }}
            >
              Add Link
            </Button>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            {socialLinks.length === 0 ? (
              <Box sx={settingsDashedEmptySx}>
                <Typography variant="body2" color="text.secondary">
                  No social links yet. Add one above.
                </Typography>
              </Box>
            ) : (
              socialLinks.map((link) => (
                <Paper key={link.id} elevation={0} sx={settingsNestedSx}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: { xs: "1fr", md: "140px 1fr auto" },
                      alignItems: { md: "end" },
                    }}
                  >
                    <FormControl size={textFieldSize} fullWidth>
                      <InputLabel id={`platform-${link.id}`}>Platform</InputLabel>
                      <Select
                        labelId={`platform-${link.id}`}
                        label="Platform"
                        value={link.platform}
                        onChange={(event) =>
                          handleSocialChange(link.id, "platform", event.target.value)
                        }
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <MenuItem key={platform.id} value={platform.id}>
                            {platform.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="URL"
                      size={textFieldSize}
                      fullWidth
                      type="url"
                      value={link.url}
                      onChange={(event) => handleSocialChange(link.id, "url", event.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />

                    <Stack
                      direction={{ xs: "row", sm: "column" }}
                      spacing={1}
                      alignItems={{ xs: "center", sm: "stretch" }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={link.enabled}
                            onChange={(event) =>
                              handleSocialChange(link.id, "enabled", event.target.checked)
                            }
                          />
                        }
                        label="Show"
                        sx={{
                          m: 0,
                          px: 1,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1,
                          bgcolor: "background.paper",
                        }}
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
                        onClick={() =>
                          setSocialLinks((current) =>
                            current.filter((entry) => entry.id !== link.id)
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      </Box>
    </SettingsPageShell>
  );
}
