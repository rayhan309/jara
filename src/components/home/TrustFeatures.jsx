import Box from "@mui/material/Box";
import StoreContainer from "@/components/container/StoreContainer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const FEATURES = [
  { icon: AutorenewRoundedIcon, title: "সহজ এক্সচেঞ্জ গ্যারান্টি" },
  { icon: LocalShippingOutlinedIcon, title: "সারাদেশে ক্যাশ অন ডেলিভারি" },
  { icon: VerifiedUserOutlinedIcon, title: "নিরাপদ ও সহজ পেমেন্ট" },
  { icon: HeadsetMicOutlinedIcon, title: "দ্রুত কাস্টমার সাপোর্ট" },
];

export default function TrustFeatures() {
  return (
    <Box component="section" sx={{ bgcolor: "background.paper", py: { xs: 2, sm: 2.5 } }}>
      <StoreContainer>
        <Box
          sx={{
            overflow: "hidden",
            borderRadius: { xs: 2, sm: 999 },
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            sx={{
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              display: { xs: "flex", sm: "grid" },
              gridTemplateColumns: { sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
              "& > *": {
                borderRight: { sm: 1 },
                borderColor: "divider",
                "&:last-child": { borderRight: { sm: 0 } },
              },
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Stack
                  key={feature.title}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    minWidth: { xs: "78%", sm: "auto" },
                    flexShrink: { xs: 0, sm: 1 },
                    scrollSnapAlign: "start",
                    px: { xs: 2, sm: 2.5, lg: 3 },
                    py: { xs: 1.75, sm: 2 },
                    justifyContent: { lg: "center" },
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 28, sm: 32 }, color: "text.primary", flexShrink: 0 }} />
                  <Typography variant="body2" fontWeight={700} color="text.primary" lineHeight={1.35}>
                    {feature.title}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </StoreContainer>
    </Box>
  );
}
