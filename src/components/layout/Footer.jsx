"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import ShopLogo from "@/components/layout/ShopLogo";
import { getActiveSocialLinks, getSocialIcon } from "@/lib/socialLinks";
import { getShopLogoUrl } from "@/lib/siteSettings";
import { SITE_NAME_SHORT } from "@/lib/siteMetadata";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/orders-traking", label: "Track order" },
];

const supportLinks = [
  { href: "/support#contact", label: "Contact support" },
  { href: "/support#shipping", label: "Shipping policy" },
  { href: "/support#returns", label: "Return policy" },
  { href: "/support#privacy", label: "Privacy policy" },
];

export default function Footer() {
  const settings = useStoreSettings();
  const socialLinks = getActiveSocialLinks(settings);
  const contactPhone = settings?.contactPhone || "+8801815131040";
  const contactEmail = settings?.contactEmail || "support@raisasglamnest.com";
  const contactAddress = settings?.contactAddress || "Dhaka, Bangladesh";
  const shortDescription =
    settings?.shopShortDescription ||
    "Your trusted online shopping destination. Quality products, fast delivery, and easy order tracking.";
  const tagline = settings?.shopTagline || "Built for modern e-commerce";
  const copyrightText =
    settings?.copyrightText || `© {year} ${SITE_NAME_SHORT}. All rights reserved.`;
  const renderedCopyright = copyrightText.replace("{year}", new Date().getFullYear());
  const logoUrl = getShopLogoUrl(settings);

  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <StoreContainer className="py-10 sm:py-12 lg:py-16">
        <Grid container spacing={{ xs: 4, sm: 4, lg: 5 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Stack
              component={Link}
              href="/"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ textDecoration: "none", color: "inherit", width: "fit-content" }}
            >
              <ShopLogo logoUrl={logoUrl} size="md" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 280, lineHeight: 1.7 }}>
              {shortDescription}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <IconButton
                      key={link.id}
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      size="small"
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        color: "text.secondary",
                        "&:hover": {
                          borderColor: "primary.light",
                          bgcolor: "primary.light",
                          color: "primary.main",
                        },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  );
                })
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Add social links from admin settings.
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Quick links
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {quickLinks.map((link) => (
                <Typography
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "fit-content",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {link.label}
                  <CallMadeRoundedIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Help
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {supportLinks.map((link) => (
                <Typography
                  key={link.label}
                  component={Link}
                  href={link.href}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "fit-content",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {link.label}
                  <CallMadeRoundedIcon sx={{ fontSize: 12, opacity: 0.6 }} />
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Contact
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <LocationOnOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  {contactAddress}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <PhoneOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {contactPhone}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <EmailOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {contactEmail}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </StoreContainer>

      <Box sx={{ borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
        <StoreContainer className="flex flex-col sm:flex-row items-center justify-between gap-1.5 py-2.5 text-center sm:text-left">
          <Typography variant="caption" color="text.disabled">
            {renderedCopyright}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {tagline}
          </Typography>
        </StoreContainer>
      </Box>
    </Box>
  );
}
