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
import { motion } from "motion/react";
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

const easeOut = [0.22, 1, 0.36, 1];

const columnVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: index * 0.08, ease: easeOut },
  }),
};

const linkSx = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  width: "fit-content",
  transition: "color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    color: "primary.main",
    transform: "translateX(3px)",
  },
  "&:hover .footer-link-arrow": {
    opacity: 1,
    transform: "translate(1px, -1px)",
  },
};

function FooterColumn({ index, children }) {
  return (
    <Grid
      size={{ xs: 12, sm: 6, lg: 3 }}
      component={motion.div}
      custom={index}
      variants={columnVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </Grid>
  );
}

function FooterNavLink({ href, label }) {
  return (
    <Typography component={Link} href={href} variant="body2" color="text.secondary" sx={linkSx}>
      {label}
      <CallMadeRoundedIcon
        className="footer-link-arrow"
        sx={{
          fontSize: 12,
          opacity: 0.55,
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      />
    </Typography>
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
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <StoreContainer className="py-10 sm:py-12 lg:py-16">
        <Grid container spacing={{ xs: 4, sm: 4, lg: 5 }}>
          <FooterColumn index={0}>
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
                socialLinks.map((link, index) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <Box
                      key={link.id}
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.3, ease: easeOut }}
                      whileHover={{ y: -2 }}
                    >
                      <IconButton
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
                          transition: "border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease",
                          "&:hover": {
                            borderColor: "primary.light",
                            bgcolor: "primary.light",
                            color: "primary.main",
                          },
                        }}
                      >
                        <Icon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Add social links from admin settings.
                </Typography>
              )}
            </Stack>
          </FooterColumn>

          <FooterColumn index={1}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Quick links
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {quickLinks.map((link) => (
                <FooterNavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </Stack>
          </FooterColumn>

          <FooterColumn index={2}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Help
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {supportLinks.map((link) => (
                <FooterNavLink key={link.label} href={link.href} label={link.label} />
              ))}
            </Stack>
          </FooterColumn>

          <FooterColumn index={3}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Contact
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack
                component={motion.div}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28, duration: 0.35, ease: easeOut }}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
              >
                <LocationOnOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  {contactAddress}
                </Typography>
              </Stack>
              <Stack
                component={motion.div}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.34, duration: 0.35, ease: easeOut }}
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <PhoneOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {contactPhone}
                </Typography>
              </Stack>
              <Stack
                component={motion.div}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.35, ease: easeOut }}
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <EmailOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {contactEmail}
                </Typography>
              </Stack>
            </Stack>
          </FooterColumn>
        </Grid>
      </StoreContainer>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.15, ease: easeOut }}
        sx={{ borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}
      >
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
