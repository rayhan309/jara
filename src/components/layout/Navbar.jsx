"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import StoreContainer from "@/components/container/StoreContainer";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { clearSelectedCategoryId, setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCategories } from "@/hooks/useCategories";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import ShopLogo from "@/components/layout/ShopLogo";
import { getShopLogoUrl } from "@/lib/siteSettings";

const navLinks = [
  { href: "/", label: "হোম" },
  { href: "/products", label: "পণ্য", match: (path) => path === "/products" || path.startsWith("/products/") },
  { href: "/categories", label: "ক্যাটাগরি", match: (path) => path === "/categories" || path.startsWith("/categories/") },
  { href: "/orders-traking", label: "অর্ডার ট্র্যাক" },
];

const iconButtonSx = {
  width: 40,
  height: 40,
  color: "text.primary",
  "&:hover": { bgcolor: "grey.100" },
};

const badgeSx = {
  "& .MuiBadge-badge": {
    fontSize: 10,
    minWidth: 16,
    height: 16,
    top: 4,
    right: 4,
  },
};

function isLinkActive(link, pathname) {
  return link.match ? link.match(pathname) : pathname === link.href;
}

function HeaderSearch({ compact = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    if (pathname === "/products") {
      setQuery(urlQuery);
    }
  }, [pathname, urlQuery]);

  function handleSubmit(event) {
    event.preventDefault();
    const term = query.trim();
    clearSelectedCategoryId();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        alignItems: "center",
        width: 1,
        maxWidth: compact ? 1 : 420,
        height: 40,
        px: 1.5,
        borderRadius: 1,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        "&:focus-within": {
          bgcolor: "background.paper",
          borderColor: "text.primary",
        },
      }}
    >
      <SearchRoundedIcon sx={{ color: "text.disabled", fontSize: 18, flexShrink: 0 }} />
      <InputBase
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="পণ্য খুঁজুন"
        sx={{ flex: 1, ml: 1, fontSize: 14 }}
        slotProps={{ input: { "aria-label": "পণ্য খুঁজুন" } }}
      />
    </Box>
  );
}

function SearchFallback() {
  return (
    <Box
      sx={{
        width: 1,
        maxWidth: 420,
        height: 40,
        borderRadius: 1,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
      }}
    />
  );
}

function NavLink({ link, pathname, onClick }) {
  const active = isLinkActive(link, pathname);

  return (
    <Box
      component={Link}
      href={link.href}
      onClick={onClick}
      sx={{
        position: "relative",
        textDecoration: "none",
        color: active ? "text.primary" : "text.secondary",
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        py: 0.5,
        transition: "color 0.15s ease",
        "&:hover": { color: "text.primary" },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -2,
          height: 1.5,
          bgcolor: "text.primary",
          opacity: active ? 1 : 0,
          transition: "opacity 0.15s ease",
        },
      }}
    >
      {link.label}
    </Box>
  );
}

export default function Navbar() {
  const settings = useStoreSettings();
  const logoUrl = getShopLogoUrl(settings);
  const CONTACT_PHONE = settings.contactPhone || "+8801815131040";
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: categories = [] } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: scrolled ? "0 8px 24px -20px rgba(15,23,42,0.35)" : "none",
        }}
      >
        <StoreContainer>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              minHeight: { xs: 64, md: 72 },
              alignItems: "center",
            }}
          >
            <IconButton
              aria-label="মেনু খুলুন"
              onClick={() => setMenuOpen(true)}
              sx={{ ...iconButtonSx, display: { xs: "inline-flex", md: "none" }, ml: -1 }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box
              component={Link}
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                flexShrink: 0,
              }}
            >
              <ShopLogo logoUrl={logoUrl} size="xs" />
            </Box>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                ml: 1,
              }}
            >
              {navLinks.map((link) => (
                <NavLink key={link.href} link={link} pathname={pathname} />
              ))}
            </Stack>

            <Box sx={{ flex: 1, display: { xs: "none", md: "flex" }, justifyContent: "flex-end", px: 2 }}>
              <Suspense fallback={<SearchFallback />}>
                <HeaderSearch />
              </Suspense>
            </Box>

            <Stack direction="row" spacing={0.25} sx={{ ml: "auto", alignItems: "center" }}>
              <IconButton
                aria-label="উইশলিস্ট"
                onClick={() => setWishlistOpen(true)}
                sx={iconButtonSx}
              >
                <Badge badgeContent={wishlistCount} color="primary" max={9} sx={badgeSx}>
                  <FavoriteBorderRoundedIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
              <IconButton
                aria-label="কার্ট"
                onClick={() => setCartOpen(true)}
                sx={iconButtonSx}
              >
                <Badge badgeContent={cartCount} color="primary" max={9} sx={badgeSx}>
                  <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Stack>
          </Stack>

          <Box sx={{ display: { xs: "block", md: "none" }, pb: 1.25 }}>
            <Suspense fallback={<SearchFallback />}>
              <HeaderSearch compact />
            </Suspense>
          </Box>
        </StoreContainer>
      </Box>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "min(320px, 86vw)", sm: 340 },
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ShopLogo logoUrl={logoUrl} size="xs" />
          <IconButton aria-label="মেনু বন্ধ করুন" onClick={() => setMenuOpen(false)} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack spacing={0.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          {navLinks.map((link) => {
            const active = isLinkActive(link, pathname);
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  px: 1.5,
                  py: 1,
                  color: active ? "text.primary" : "text.secondary",
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? "grey.50" : "transparent",
                }}
              >
                {link.label}
              </Button>
            );
          })}

          {categories.length > 0 ? (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, mb: 0.5, fontWeight: 600 }}>
                ক্যাটাগরি অনুযায়ী কিনুন
              </Typography>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  component={Link}
                  href={`/products?category=${category.slug}`}
                  onClick={() => {
                    setSelectedCategoryId(category._id);
                    setMenuOpen(false);
                  }}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    px: 1.5,
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </>
          ) : null}
        </Stack>

        <Stack
          spacing={1.25}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            pb: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <Stack
            component="a"
            href={`tel:${CONTACT_PHONE}`}
            direction="row"
            spacing={1.25}
            sx={{
              textDecoration: "none",
              color: "inherit",
              p: 1.25,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              alignItems: "center",
            }}
          >
            <PhoneOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>
                কল করুন
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {CONTACT_PHONE}
              </Typography>
            </Box>
          </Stack>
          <Button
            component={Link}
            href="/orders-traking"
            onClick={() => setMenuOpen(false)}
            variant="contained"
            fullWidth
            startIcon={<LocalShippingOutlinedIcon />}
          >
            অর্ডার ট্র্যাক করুন
          </Button>
        </Stack>
      </Drawer>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistSidebar open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
