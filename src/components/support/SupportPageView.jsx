"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";

import StoreContainer from "@/components/container/StoreContainer";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";

const navItems = [
  { id: "contact", label: "Contact support" },
  { id: "shipping", label: "Shipping policy" },
  { id: "returns", label: "Return policy" },
  { id: "privacy", label: "Privacy policy" },
];

function PolicySection({ id, title, children }) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        scrollMarginTop: 96,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        p: { xs: 2.5, sm: 3 },
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          height: 2,
          width: 40,
          borderRadius: 1,
          background: "linear-gradient(90deg, #6366f1, rgba(99,102,241,0.35))",
        }}
      />
      <Stack spacing={1.5} sx={{ mt: 2, typography: "body2", color: "text.secondary", "& strong": { fontWeight: 600, color: "text.primary" } }}>
        {children}
      </Stack>
    </Box>
  );
}

export default function SupportPageView() {
  const settings = useStoreSettings();
  const CONTACT_PHONE = settings.contactPhone || "+8801815131040";
  const CONTACT_EMAIL = settings.contactEmail || "support@raisasglamnest.com";
  const CONTACT_ADDRESS = settings.contactAddress || "Dhaka, Bangladesh";

  return (
    <StoreContainer className="py-8 sm:py-10 lg:py-12">
      <Box sx={{ mx: "auto", maxWidth: 720 }}>
        <Stack sx={{ alignItems: "center", textAlign: "center" }}>
          <Typography variant="caption" fontWeight={700} color="primary" sx={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Help
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
            Help & policies
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contact, delivery, returns, and privacy information in one place.
          </Typography>
        </Stack>

        <Stack
          component="nav"
          aria-label="Help sections"
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          useFlexGap
          spacing={1}
          sx={{ mt: 4 }}
        >
          {navItems.map((item) => (
            <Chip
              key={item.id}
              component="a"
              href={`#${item.id}`}
              clickable
              label={item.label}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>

        <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 4, sm: 5 } }}>
          <PolicySection id="contact" title="Contact support">
            <Typography component="p">
              Contact us for any questions, order issues, or help. We'll get back to you as soon as possible.
            </Typography>

            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ borderRadius: 1, border: 1, borderColor: "grey.100", bgcolor: "grey.50", px: 1.75, py: 1.5 }}>
                <PhoneOutlinedIcon sx={{ mt: 0.25, color: "primary.main", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Phone
                  </Typography>
                  <Typography
                    component="a"
                    href={`tel:${CONTACT_PHONE}`}
                    fontWeight={600}
                    color="text.primary"
                    sx={{ display: "block", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                  >
                    {CONTACT_PHONE}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ borderRadius: 1, border: 1, borderColor: "grey.100", bgcolor: "grey.50", px: 1.75, py: 1.5 }}>
                <EmailOutlinedIcon sx={{ mt: 0.25, color: "primary.main", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Email
                  </Typography>
                  <Typography
                    component="a"
                    href={`mailto:${CONTACT_EMAIL}`}
                    fontWeight={600}
                    color="text.primary"
                    sx={{ display: "block", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                  >
                    {CONTACT_EMAIL}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ borderRadius: 1, border: 1, borderColor: "grey.100", bgcolor: "grey.50", px: 1.75, py: 1.5 }}>
                <LocationOnOutlinedIcon sx={{ mt: 0.25, color: "primary.main", fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Address
                  </Typography>
                  <Typography fontWeight={600}>{CONTACT_ADDRESS}</Typography>
                </Box>
              </Stack>
            </Stack>

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ pt: 1 }}>
              <Button
                component={Link}
                href="/orders-traking"
                variant="contained"
                startIcon={<LocalShippingOutlinedIcon />}
              >
                Track order
              </Button>
              <Button
                component="a"
                href={`tel:${CONTACT_PHONE}`}
                variant="outlined"
                startIcon={<SmsOutlinedIcon />}
              >
                Call us
              </Button>
            </Stack>
          </PolicySection>

          <PolicySection id="shipping" title="Shipping policy">
            <Typography component="p">
              We ship nationwide with <strong>Cash on Delivery (COD)</strong>. After your order is confirmed, our team will call to confirm delivery.
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">Inside Dhaka, we usually aim to deliver within 1–3 business days.</Typography>
              <Typography component="li">Outside Dhaka, delivery usually takes 3–7 business days.</Typography>
              <Typography component="li">Delivery charges are shown on the order/checkout page based on your area.</Typography>
              <Typography component="li">In special situations (Eid, storms, transport issues), delivery may take a bit longer.</Typography>
            </Box>
            <Typography component="p">
              Inspect your products when you receive them, then pay. If anything is wrong when accepting the parcel from the courier, tell us right away.
            </Typography>
          </PolicySection>

          <PolicySection id="returns" title="Return policy">
            <Typography component="p">
              Your satisfaction comes first. If a product is defective or wrong, we offer return/replacement support.
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">
                Please report issues within <strong>7 days</strong> of receiving the product.
              </Typography>
              <Typography component="li">Products must be unused and in original condition (where applicable).</Typography>
              <Typography component="li">Wrong or damaged items may be eligible for replacement or refund.</Typography>
              <Typography component="li">Returns may be limited for custom/personal items or hygiene-sensitive products.</Typography>
            </Box>
            <Typography component="p">
              For returns or replacements, call us with your order number at{" "}
              <Typography component="a" href={`tel:${CONTACT_PHONE}`} fontWeight={600} color="primary.main">
                {CONTACT_PHONE}
              </Typography>{" "}
              or email{" "}
              <Typography component="a" href={`mailto:${CONTACT_EMAIL}`} fontWeight={600} color="primary.main">
                {CONTACT_EMAIL}
              </Typography>
              .
            </Typography>
          </PolicySection>

          <PolicySection id="privacy" title="Privacy policy">
            <Typography component="p">
              Raisa&apos;s Glam Nest is committed to keeping your personal information private. We only collect what we need to process orders.
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">We collect: name, phone number, delivery address, and order details.</Typography>
              <Typography component="li">This information is used only for order processing, delivery, and customer service.</Typography>
              <Typography component="li">We do not sell or share your data with third parties without your permission.</Typography>
              <Typography component="li">Payment details are not stored on our servers — transactions use COD.</Typography>
              <Typography component="li">We may update this policy as needed to improve security.</Typography>
            </Box>
            <Typography component="p">
              For any questions about your data, contact us at{" "}
              <Typography component="a" href={`mailto:${CONTACT_EMAIL}`} fontWeight={600} color="primary.main">
                {CONTACT_EMAIL}
              </Typography>{" "}
              .
            </Typography>
          </PolicySection>
        </Stack>
      </Box>
    </StoreContainer>
  );
}
