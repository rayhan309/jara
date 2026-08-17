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
  { href: "/", label: "হোম" },
  { href: "/products", label: "পণ্য" },
  { href: "/categories", label: "ক্যাটাগরি" },
  { href: "/orders-traking", label: "অর্ডার ট্র্যাক" },
];

const supportLinks = [
  { href: "/support#contact", label: "যোগাযোগ" },
  { href: "/support#shipping", label: "শিপিং পলিসি" },
  { href: "/support#returns", label: "রিটার্ন পলিসি" },
  { href: "/support#privacy", label: "প্রাইভেসি পলিসি" },
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
  const contactAddress = settings?.contactAddress || "ঢাকা, বাংলাদেশ";
  const shortDescription =
    settings?.shopShortDescription ||
    "আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য। মানসম্মত পণ্য, দ্রুত ডেলিভারি এবং সহজ অর্ডার ট্র্যাকিং।";
  const tagline = settings?.shopTagline || "আধুনিক ই-কমার্সের জন্য তৈরি";
  const copyrightText =
    settings?.copyrightText || `© {year} ${SITE_NAME_SHORT}। সর্বস্বত্ব সংরক্ষিত।`;
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
            <FooterHeading>শপ</FooterHeading>
            <Stack spacing={1.25}>
              {shopLinks.map((link) => (
                <FooterNavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FooterHeading>সহায়তা</FooterHeading>
            <Stack spacing={1.25}>
              {supportLinks.map((link) => (
                <FooterNavLink key={link.label} href={link.href} label={link.label} />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FooterHeading>যোগাযোগ</FooterHeading>
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
