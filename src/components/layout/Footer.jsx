"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import ShopLogo from "@/components/layout/ShopLogo";
import { getActiveSocialLinks, getSocialIcon } from "@/lib/socialLinks";
import { getShopLogoUrl } from "@/lib/siteSettings";
import { SITE_NAME_SHORT } from "@/lib/siteMetadata";

const shopLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders-traking", label: "Track order" },
];

const supportLinks = [
  { href: "/support#contact", label: "Contact support" },
  { href: "/support#shipping", label: "Shipping policy" },
  { href: "/support#returns", label: "Return policy" },
  { href: "/support#privacy", label: "Privacy policy" },
];

const FOOTER_BG = "#0b1220";
const MUTED = "rgba(255,255,255,0.64)";

const linkSx = {
  textDecoration: "none",
  color: MUTED,
  width: "fit-content",
  transition: "color 0.15s ease",
  "&:hover": { color: "common.white" },
};

function FooterHeading({ children }) {
  return (
    <Typography
      variant="subtitle2"
      fontWeight={600}
      sx={{ mb: 2, color: "common.white", letterSpacing: "0.02em" }}
    >
      {children}
    </Typography>
  );
}

function FooterNavLink({ href, label }) {
  return (
    <Typography component={Link} href={href} variant="body2" sx={linkSx}>
      {label}
    </Typography>
  );
}

function ContactRow({ icon, href, children }) {
  const content = (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ color: "inherit" }}>
      <Box sx={{ mt: "1px", display: "flex", color: "inherit" }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: "inherit", lineHeight: 1.6 }}>
        {children}
      </Typography>
    </Stack>
  );

  if (!href) {
    return <Box sx={{ color: MUTED }}>{content}</Box>;
  }

  return (
    <Box component="a" href={href} sx={{ ...linkSx, display: "block" }}>
      {content}
    </Box>
  );
}

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
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, sm: 8 },
        bgcolor: FOOTER_BG,
        color: "common.white",
      }}
    >
      <StoreContainer>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ py: { xs: 6, md: 8 } }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              component={Link}
              href="/"
              sx={{
                display: "inline-flex",
                bgcolor: "common.white",
                borderRadius: 1,
                px: 1.25,
                py: 0.75,
                textDecoration: "none",
              }}
            >
              <ShopLogo logoUrl={logoUrl} size="xs" />
            </Box>
            <Typography variant="body2" sx={{ mt: 2, maxWidth: 300, lineHeight: 1.7, color: MUTED }}>
              {shortDescription}
            </Typography>
            {socialLinks.length > 0 ? (
              <Stack direction="row" spacing={0.5} sx={{ mt: 2.5 }}>
                {socialLinks.map((link) => {
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
                        width: 36,
                        height: 36,
                        color: MUTED,
                        "&:hover": {
                          color: "common.white",
                          bgcolor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  );
                })}
              </Stack>
            ) : null}
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FooterHeading>Shop</FooterHeading>
            <Stack spacing={1.25}>
              {shopLinks.map((link) => (
                <FooterNavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FooterHeading>Help</FooterHeading>
            <Stack spacing={1.25}>
              {supportLinks.map((link) => (
                <FooterNavLink key={link.label} href={link.href} label={link.label} />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FooterHeading>Contact</FooterHeading>
            <Stack spacing={1.5}>
              <ContactRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}>
                {contactAddress}
              </ContactRow>
              <ContactRow
                icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}
                href={`tel:${contactPhone}`}
              >
                {contactPhone}
              </ContactRow>
              <ContactRow
                icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </ContactRow>
            </Stack>
          </Grid>
        </Grid>
      </StoreContainer>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <StoreContainer>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              py: 2,
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.42)" }}>
              {renderedCopyright}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.42)" }}>
              {tagline}
            </Typography>
          </Stack>
        </StoreContainer>
      </Box>
    </Box>
  );
}
