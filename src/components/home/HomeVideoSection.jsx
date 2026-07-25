import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import StoreContainer from "@/components/container/StoreContainer";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import HomeSectionHeader from "@/components/home/HomeSectionHeader";

export default function HomeVideoSection() {
  return (
    <Box
      component="section"
      sx={{ borderTop: 1, borderColor: "grey.100", bgcolor: "background.paper", py: { xs: 4, sm: 6, lg: 7 } }}
    >
      <StoreContainer>
        <HomeSectionHeader
          eyebrow="Reviews"
          title="Product review videos"
          subtitle="Watch real user reviews and product demos before you buy"
          align="left"
        />

        <Grid container spacing={{ xs: 2, sm: 2.5, lg: 3 }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                bgcolor: "grey.900",
                boxShadow: 1,
              }}
            >
              <Box
                sx={{
                  aspectRatio: "16 / 9",
                  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #18181b 100%)",
                }}
              />
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: "absolute",
                  inset: 0,
                  p: { xs: 2.5, sm: 4 },
                  textAlign: "center",
                  color: "common.white",
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: 1,
                    bgcolor: "primary.main",
                    boxShadow: "0 8px 24px rgba(30,27,75,0.45)",
                  }}
                >
                  <PlayArrowRoundedIcon sx={{ fontSize: { xs: 28, sm: 32 }, ml: 0.25 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} maxWidth={400}>
                  Watch our latest product review videos
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, maxWidth: 360, color: "rgba(255,255,255,0.75)" }}>
                  Real user reviews and product demos — shop with confidence
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Stack
              justifyContent="center"
              sx={{
                height: 1,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                bgcolor: "primary.50",
                p: { xs: 2.5, sm: 3.5, lg: 4 },
                boxShadow: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                You'll also find product reviews, unboxings, and usage tips on our
                official YouTube channel.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2.5 }}>
                <Button
                  component={Link}
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{ borderRadius: 1 }}
                >
                  Watch videos
                </Button>
                <Button
                  component={Link}
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<YouTubeIcon />}
                  sx={{ borderRadius: 1, bgcolor: "background.paper" }}
                >
                  YouTube channel
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </StoreContainer>
    </Box>
  );
}
