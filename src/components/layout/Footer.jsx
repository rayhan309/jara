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
const FOOTER_BG = "#0b1220";
const MUTED = "rgba(255,255,255,0.68)";

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
  color: MUTED,
  transition: "color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    color: "common.white",
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
    <Typography component={Link} href={href} variant="body2" sx={linkSx}>
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

function ContactChip({ icon, children, delay }) {
  return (
    <Stack
      component={motion.div}
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35, ease: easeOut }}
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={{
        px: 1.25,
        py: 1,
        borderRadius: 999,
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          flexShrink: 0,
          mt: 0.1,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ color: MUTED, lineHeight: 1.5, pt: 0.35 }}>
        {children}
      </Typography>
    </Stack>
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
    <Box component="footer" sx={{ mt: { xs: 4, sm: 6 }, position: "relative", color: "common.white" }}>
      <Box
        aria-hidden
        sx={{
          position: "relative",
          height: { xs: 36, sm: 52 },
          lineHeight: 0,
          color: FOOTER_BG,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 1440 52"
          preserveAspectRatio="none"
          sx={{ display: "block", width: 1, height: 1 }}
        >
          <path fill="currentColor" d="M0 52C240 8 480 0 720 12 960 24 1200 44 1440 18V52H0Z" />
        </Box>
      </Box>

      <Box sx={{ bgcolor: FOOTER_BG, pt: { xs: 1, sm: 2 }, pb: 0 }}>
        <StoreContainer className="pb-8 sm:pb-10 lg:pb-12">
          <Grid container spacing={{ xs: 4, sm: 4, lg: 5 }}>
            <FooterColumn index={0}>
              <Stack
                component={Link}
                href="/"
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  width: "fit-content",
                  bgcolor: "common.white",
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <ShopLogo logoUrl={logoUrl} size="sm" />
              </Stack>
              <Typography variant="body2" sx={{ mt: 2.25, maxWidth: 280, lineHeight: 1.7, color: MUTED }}>
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
                            width: 38,
                            height: 38,
                            border: "1px solid rgba(255,255,255,0.14)",
                            borderRadius: "50%",
                            color: MUTED,
                            transition: "border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease",
                            "&:hover": {
                              borderColor: "primary.light",
                              bgcolor: "primary.main",
                              color: "common.white",
                            },
                          }}
                        >
                          <Icon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                    Add social links from admin settings.
                  </Typography>
                )}
              </Stack>
            </FooterColumn>

            <FooterColumn index={1}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ letterSpacing: "0.04em" }}>
                Quick links
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {quickLinks.map((link) => (
                  <FooterNavLink key={link.href} href={link.href} label={link.label} />
                ))}
              </Stack>
            </FooterColumn>

            <FooterColumn index={2}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ letterSpacing: "0.04em" }}>
                Help
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {supportLinks.map((link) => (
                  <FooterNavLink key={link.label} href={link.href} label={link.label} />
                ))}
              </Stack>
            </FooterColumn>

            <FooterColumn index={3}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ letterSpacing: "0.04em" }}>
                Contact
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                <ContactChip delay={0.28} icon={<LocationOnOutlinedIcon sx={{ fontSize: 15 }} />}>
                  {contactAddress}
                </ContactChip>
                <ContactChip delay={0.34} icon={<PhoneOutlinedIcon sx={{ fontSize: 15 }} />}>
                  {contactPhone}
                </ContactChip>
                <ContactChip delay={0.4} icon={<EmailOutlinedIcon sx={{ fontSize: 15 }} />}>
                  {contactEmail}
                </ContactChip>
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
          sx={{ px: { xs: 1.5, sm: 2 }, pb: 1.5 }}
        >
          <Box
            sx={{
              mx: "auto",
              width: 1,
              maxWidth: "80rem",
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              px: { xs: 2, sm: 3 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                py: 1.25,
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                {renderedCopyright}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                {tagline}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
