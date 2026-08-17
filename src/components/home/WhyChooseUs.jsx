"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { motion } from "motion/react";

import StoreContainer from "@/components/container/StoreContainer";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

const FEATURES = [
  {
    icon: PaymentsOutlinedIcon,
    title: "ক্যাশ অন ডেলিভারি",
    description: "নিশ্চিন্তে কিনুন — পার্সেল হাতে পেয়ে তারপর টাকা দিন।",
  },
  {
    icon: PublicOutlinedIcon,
    title: "ইমপোর্টেড পণ্য",
    description: "বিশ্বের বিভিন্ন দেশ থেকে আনা পণ্য আমরা অফার করি।",
  },
  {
    icon: VerifiedOutlinedIcon,
    title: "বিশ্বস্ত মান",
    description: "ফিনিশ ও ডিটেইলে যত্ন নিয়ে বেছে নেওয়া পণ্য।",
  },
  {
    icon: SupportAgentOutlinedIcon,
    title: "বন্ধুত্বপূর্ণ সাপোর্ট",
    description: "অর্ডারে সাহায্য লাগলে আমরা সবসময় আছি।",
  },
];

const easeOut = [0.22, 1, 0.36, 1];

export default function WhyChooseUs() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, sm: 6, md: 8 },
        bgcolor: "grey.50",
        borderTop: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <StoreContainer>
        <HomeSectionHeader
          align="center"
          eyebrow="কেন আমাদের বেছে নেবেন?"
          title="কেন জারা স্পেশাল?"
          subtitle="সহজ শপিং, যত্নসহকারে প্যাকেজিং, আর আসল সাহায্য — প্রতিটি অর্ডারে।"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 2, sm: 2.5, lg: 3 },
          }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Box
                key={feature.title}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: easeOut }}
              >
                <Stack
                  spacing={1.5}
                  sx={{
                    height: 1,
                    px: { xs: 2, sm: 2.25 },
                    py: { xs: 2.25, sm: 2.5 },
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 12px 28px -16px rgba(15, 23, 42, 0.2)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.50",
                      color: "primary.main",
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </StoreContainer>
    </Box>
  );
}
