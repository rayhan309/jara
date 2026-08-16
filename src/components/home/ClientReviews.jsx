"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import { motion } from "motion/react";

import StoreContainer from "@/components/container/StoreContainer";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";
import { usePublicClientReviews } from "@/hooks/useClientReviews";

const easeOut = [0.22, 1, 0.36, 1];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function ReviewCard({ review, index }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.24), ease: easeOut }}
      sx={{ height: 1 }}
    >
      <Stack
        spacing={2}
        sx={{
          height: 1,
          px: { xs: 2.25, sm: 2.5 },
          py: { xs: 2.5, sm: 2.75 },
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
        <FormatQuoteRoundedIcon sx={{ fontSize: 28, color: "primary.main", opacity: 0.85 }} />
        <Rating value={review.rating} readOnly size="small" />
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flex: 1 }}>
          {review.quote}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pt: 0.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {getInitials(review.name) || "C"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {review.name}
            </Typography>
            {review.location ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {review.location}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function ClientReviews() {
  const { data: reviews = [], isLoading } = usePublicClientReviews();

  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, sm: 6, md: 8 },
        bgcolor: "background.paper",
      }}
    >
      <StoreContainer>
        <HomeSectionHeader
          align="center"
          eyebrow="Testimonials"
          title="What our clients say"
          subtitle="Real feedback from customers who shopped with Jara."
        />

        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            {[0, 1, 2].map((item) => (
              <Box
                key={item}
                sx={{
                  height: 220,
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "grey.50",
                }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: reviews.length === 1 ? "1fr" : reviews.length === 2 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              },
              gap: { xs: 2, sm: 2.5, lg: 3 },
              maxWidth: reviews.length < 3 ? 880 : "none",
              mx: reviews.length < 3 ? "auto" : 0,
            }}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={review._id} review={review} index={index} />
            ))}
          </Box>
        )}
      </StoreContainer>
    </Box>
  );
}
