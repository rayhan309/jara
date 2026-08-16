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
import { motion } from "motion/react";

import StoreContainer from "@/components/container/StoreContainer";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import { hindSiliguri } from "@/lib/fonts";
import { SITE_NAME } from "@/lib/siteMetadata";

const navItems = [
  { id: "contact", label: "Contact support" },
  { id: "shipping", label: "Shipping policy" },
  { id: "returns", label: "Return policy" },
  { id: "privacy", label: "Privacy policy" },
];

const banglaFontFamily = "var(--font-hind-siliguri), 'Hind Siliguri', sans-serif";
const easeOut = [0.22, 1, 0.36, 1];

const contactRowSx = {
  borderRadius: 1,
  border: 1,
  borderColor: "grey.100",
  bgcolor: "grey.50",
  px: 1.75,
  py: 1.5,
  transition: "border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    borderColor: "primary.light",
    bgcolor: "background.paper",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
  },
};

function PolicySection({ id, title, bangla = false, index = 0, children }) {
  return (
    <Box
      component={motion.section}
      id={id}
      lang={bangla ? "bn" : undefined}
      className={bangla ? hindSiliguri.className : undefined}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: easeOut }}
      whileHover={{ y: -2 }}
      sx={{
        scrollMarginTop: 96,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        p: { xs: 2.5, sm: 3 },
        boxShadow: 1,
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
        "&:hover": {
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
          borderColor: "primary.light",
        },
        ...(bangla
          ? {
              fontFamily: banglaFontFamily,
              "& .MuiTypography-root": { fontFamily: banglaFontFamily },
            }
          : null),
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
        <Stack
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          sx={{ alignItems: "center", textAlign: "center" }}
        >
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
          component={motion.nav}
          aria-label="Help sections"
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          useFlexGap
          spacing={1}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
          }}
          sx={{ mt: 4 }}
        >
          {navItems.map((item) => (
            <Box
              key={item.id}
              component={motion.div}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } },
              }}
            >
              <Chip
                component="a"
                href={`#${item.id}`}
                clickable
                label={item.label}
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  transition: "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }}
              />
            </Box>
          ))}
        </Stack>

        <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: { xs: 4, sm: 5 } }}>
          <PolicySection id="contact" title="Contact support" index={0}>
            <Typography component="p">
              Contact us for any questions, order issues, or help. We&apos;ll get back to you as soon as possible.
            </Typography>

            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              <Stack direction="row" spacing={1.5} sx={contactRowSx}>
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
                    sx={{ display: "block", textDecoration: "none", transition: "color 0.2s ease", "&:hover": { color: "primary.main" } }}
                  >
                    {CONTACT_PHONE}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={contactRowSx}>
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
                    sx={{ display: "block", textDecoration: "none", transition: "color 0.2s ease", "&:hover": { color: "primary.main" } }}
                  >
                    {CONTACT_EMAIL}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={contactRowSx}>
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

          <PolicySection id="shipping" title="Shipping policy" index={1}>
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

          <PolicySection id="shipping-bn" title="শিপিং পলিসি" bangla index={2}>
            <Typography component="p">
              আমরা <strong>ক্যাশ অন ডেলিভারি (COD)</strong> সহ সারাদেশে পণ্য পাঠাই। অর্ডার কনফার্ম হওয়ার পর আমাদের টিম ডেলিভারি নিশ্চিত করতে কল করবে।
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">ঢাকার ভিতরে সাধারণত ১–৩ কার্যদিবসের মধ্যে ডেলিভারি দেওয়ার চেষ্টা করি।</Typography>
              <Typography component="li">ঢাকার বাইরে সাধারণত ৩–৭ কার্যদিবস সময় লাগে।</Typography>
              <Typography component="li">আপনার এলাকা অনুযায়ী ডেলিভারি চার্জ অর্ডার/চেকআউট পেজে দেখানো হয়।</Typography>
              <Typography component="li">বিশেষ পরিস্থিতিতে (ঈদ, ঝড়, যাতায়াত সমস্যা) ডেলিভারিতে কিছুটা বেশি সময় লাগতে পারে।</Typography>
            </Box>
            <Typography component="p">
              পার্সেল গ্রহণের সময় পণ্য যাচাই করে তারপর টাকা দিন। কুরিয়ার থেকে পার্সেল নেওয়ার সময় কোনো সমস্যা থাকলে সঙ্গে সঙ্গে আমাদের জানান।
            </Typography>
          </PolicySection>

          <PolicySection id="returns" title="Return policy" index={3}>
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

          <PolicySection id="returns-bn" title="রিটার্ন পলিসি" bangla index={4}>
            <Typography component="p">
              আপনার সন্তুষ্টি আমাদের অগ্রাধিকার। পণ্যে ত্রুটি থাকলে বা ভুল পণ্য পেলে আমরা রিটার্ন/রিপ্লেসমেন্ট সাপোর্ট দিই।
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">
                পণ্য পাওয়ার <strong>৭ দিনের</strong> মধ্যে সমস্যা জানান।
              </Typography>
              <Typography component="li">পণ্য অব্যবহৃত এবং আসল অবস্থায় থাকতে হবে (প্রযোজ্য ক্ষেত্রে)।</Typography>
              <Typography component="li">ভুল বা ক্ষতিগ্রস্ত পণ্য রিপ্লেসমেন্ট বা রিফান্ডের জন্য যোগ্য হতে পারে।</Typography>
              <Typography component="li">কাস্টম/পারসোনাল আইটেম বা হাইজিন-সংবেদনশীল পণ্যের ক্ষেত্রে রিটার্ন সীমিত হতে পারে।</Typography>
            </Box>
            <Typography component="p">
              রিটার্ন বা রিপ্লেসমেন্টের জন্য অর্ডার নম্বরসহ কল করুন{" "}
              <Typography component="a" href={`tel:${CONTACT_PHONE}`} fontWeight={600} color="primary.main">
                {CONTACT_PHONE}
              </Typography>{" "}
              অথবা ইমেইল করুন{" "}
              <Typography component="a" href={`mailto:${CONTACT_EMAIL}`} fontWeight={600} color="primary.main">
                {CONTACT_EMAIL}
              </Typography>
              ।
            </Typography>
          </PolicySection>

          <PolicySection id="privacy" title="Privacy policy" index={5}>
            <Typography component="p">
              {SITE_NAME} is committed to keeping your personal information private. We only collect what we need to process orders.
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
              </Typography>
              .
            </Typography>
          </PolicySection>

          <PolicySection id="privacy-bn" title="প্রাইভেসি পলিসি" bangla index={6}>
            <Typography component="p">
              {SITE_NAME} আপনার ব্যক্তিগত তথ্য গোপন রাখতে প্রতিশ্রুতিবদ্ধ। অর্ডার প্রসেস করতে যা প্রয়োজন শুধু তাই সংগ্রহ করি।
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li">আমরা সংগ্রহ করি: নাম, ফোন নম্বর, ডেলিভারি ঠিকানা এবং অর্ডারের বিবরণ।</Typography>
              <Typography component="li">এই তথ্য শুধু অর্ডার প্রসেসিং, ডেলিভারি এবং কাস্টমার সার্ভিসের জন্য ব্যবহৃত হয়।</Typography>
              <Typography component="li">আপনার অনুমতি ছাড়া আমরা তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি বা শেয়ার করি না।</Typography>
              <Typography component="li">পেমেন্টের বিবরণ আমাদের সার্ভারে সংরক্ষিত হয় না — লেনদেন COD-এর মাধ্যমে হয়।</Typography>
              <Typography component="li">নিরাপত্তা উন্নত করতে প্রয়োজনমতো এই পলিসি আপডেট করা হতে পারে।</Typography>
            </Box>
            <Typography component="p">
              আপনার ডেটা সংক্রান্ত যেকোনো প্রশ্নের জন্য যোগাযোগ করুন{" "}
              <Typography component="a" href={`mailto:${CONTACT_EMAIL}`} fontWeight={600} color="primary.main">
                {CONTACT_EMAIL}
              </Typography>
              ।
            </Typography>
          </PolicySection>
        </Stack>
      </Box>
    </StoreContainer>
  );
}
