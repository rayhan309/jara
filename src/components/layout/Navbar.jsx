"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import StoreContainer from "@/components/container/StoreContainer";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { clearSelectedCategoryId, setSelectedCategoryId } from "@/lib/categoryFilter";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCategories } from "@/hooks/useCategories";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useStoreSettings } from "@/components/providers/SiteSettingsProvider";
import ShopLogo from "@/components/layout/ShopLogo";
import { getShopLogoUrl } from "@/lib/siteSettings";

const NAV_EASE = [0.22, 1, 0.36, 1];
const NAV_TRANSITION = { duration: 0.38, ease: NAV_EASE };

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products", match: (path) => path === "/products" || path.startsWith("/products/") },
  { href: "/categories", label: "Categories", match: (path) => path === "/categories" || path.startsWith("/categories/") },
  { href: "/orders-traking", label: "Track order" },
];

function HeaderSearch() {
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
    if (term) {
      router.push(`/products?q=${encodeURIComponent(term)}`);
      return;
    }
    router.push("/products");
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        alignItems: "center",
        width: 1,
        maxWidth: 560,
        mx: "auto",
        borderRadius: 1.5,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.08)",
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
        "&:focus-within": {
          bgcolor: "background.paper",
          borderColor: "primary.main",
          boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}22`,
        },
      }}
    >
      <SearchRoundedIcon sx={{ ml: 1.5, color: "text.disabled", fontSize: 20, flexShrink: 0 }} />
      <InputBase
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products..."
        sx={{ flex: 1, px: 1.25, py: 1.1, fontSize: 14 }}
        slotProps={{ input: { "aria-label": "Search products" } }}
      />
      <Button
        type="submit"
        aria-label="Search products"
        variant="contained"
        sx={{
          minWidth: 0,
          px: 2,
          py: 1.15,
          borderRadius: 0,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        }}
      >
        <SearchRoundedIcon sx={{ fontSize: 18 }} />
      </Button>
    </Box>
  );
}

function ActionIconButton({ label, onClick, badgeContent, children, sx = {} }) {
  return (
    <IconButton
      aria-label={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.25,
        bgcolor: "rgba(255,255,255,0.14)",
        color: "inherit",
        border: "1px solid rgba(255,255,255,0.18)",
        transition: "background-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.24)",
          transform: "translateY(-1px)",
        },
        ...sx,
      }}
    >
      {badgeContent != null ? (
        <Badge
          badgeContent={badgeContent}
          color="error"
          max={9}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 10,
              minWidth: 16,
              height: 16,
              top: 2,
              right: 2,
            },
          }}
        >
          {children}
        </Badge>
      ) : (
        children
      )}
    </IconButton>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarFallback() {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          color: "primary.contrastText",
          py: 0.75,
          textAlign: "center",
        }}
      >
        <Typography variant="caption">Trusted online shopping — fast delivery & easy order tracking</Typography>
      </Box>
      <Toolbar sx={{ minHeight: { xs: 72, sm: 80 } }} />
    </Box>
  );
}

function CategoryNavButtons({ pathname, activeCategorySlug, categories, isLoading, tone = "onPrimary" }) {
  const onPrimary = tone === "onPrimary";
  const homeActive = pathname === "/";

  const btnSx = (active) => ({
    color: onPrimary ? "inherit" : active ? "primary.main" : "text.primary",
    minHeight: 32,
    px: 1.5,
    borderRadius: onPrimary ? 1 : 999,
    bgcolor: active ? (onPrimary ? "rgba(255,255,255,0.22)" : "primary.50") : "transparent",
    flexShrink: 0,
    fontWeight: active ? 700 : onPrimary ? 600 : 500,
    fontSize: 13,
    "&:hover": {
      bgcolor: onPrimary ? "rgba(255,255,255,0.14)" : "grey.100",
    },
  });

  return (
    <>
      <Button component={Link} href="/" size="small" sx={btnSx(homeActive)}>
        Home
      </Button>
      {isLoading ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: 1,
            color: onPrimary ? "rgba(255,255,255,0.75)" : "text.secondary",
            alignItems: "center",
          }}
        >
          <CircularProgress size={14} color="inherit" />
          <Typography variant="caption">Loading...</Typography>
        </Stack>
      ) : (
        categories.map((category) => {
          const active = pathname === "/products" && activeCategorySlug === category.slug;
          return (
            <Button
              key={category._id}
              component={Link}
              href={`/products?category=${category.slug}`}
              onClick={() => setSelectedCategoryId(category._id)}
              size="small"
              sx={btnSx(active)}
            >
              {category.name}
            </Button>
          );
        })
      )}
    </>
  );
}

function NavbarContent() {
  const settings = useStoreSettings();
  const logoUrl = getShopLogoUrl(settings);
  const CONTACT_PHONE = settings.contactPhone || "+8801815131040";
  const whatsappPhone = CONTACT_PHONE.replace(/\+/g, "").trim();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get("category");
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: categories = [], isLoading } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const scrolledRef = useRef(false);
  const defaultNavRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    if (scrolled || !defaultNavRef.current) return;
    setSpacerHeight(Math.ceil(defaultNavRef.current.getBoundingClientRect().height));
  }, [scrolled, categories.length, isLoading]);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const next = scrolledRef.current ? y > 48 : y > 100;
        if (next === scrolledRef.current) return;

        if (next && defaultNavRef.current) {
          setSpacerHeight(Math.ceil(defaultNavRef.current.getBoundingClientRect().height));
        }

        scrolledRef.current = next;
        setScrolled(next);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const compactIconSx = {
    bgcolor: "grey.50",
    color: "text.primary",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "50%",
    "&:hover": { bgcolor: "grey.100", transform: "translateY(-1px)" },
  };

  return (
    <>
      <Box
        sx={{
          height: scrolled ? spacerHeight : "auto",
          position: "relative",
          zIndex: scrolled ? 0 : (theme) => theme.zIndex.appBar,
          overflow: "hidden",
        }}
      >
        <AnimatePresence initial={false}>
          {!scrolled ? (
            <Box
              component={motion.div}
              key="default-nav"
              ref={defaultNavRef}
              initial={{ y: "-55%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-110%", opacity: 0 }}
              transition={NAV_TRANSITION}
              sx={{
                width: 1,
                bgcolor: "background.paper",
                boxShadow: "0 8px 24px -18px rgba(15,23,42,0.35)",
                willChange: "transform, opacity",
              }}
            >
              <Box
                sx={{
                  background: (theme) =>
                    `linear-gradient(105deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark} 100%)`,
                  color: "primary.contrastText",
                  py: 0.65,
                  px: 1.5,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={500}
                  sx={{ letterSpacing: "0.02em", opacity: 0.95, whiteSpace: "nowrap" }}
                >
                  Trusted online shopping — fast delivery & easy order tracking
                </Typography>
              </Box>

              <Box component="header">
                <StoreContainer>
                  <Toolbar
                    disableGutters
                    sx={{
                      py: 1.25,
                      gap: { xs: 1, sm: 2 },
                      minHeight: { xs: 72, sm: 84 },
                    }}
                  >
                    <Stack
                      component={Link}
                      href="/"
                      direction="row"
                      spacing={1.5}
                      sx={{ textDecoration: "none", color: "inherit", flexShrink: 0, alignItems: "center" }}
                    >
                      <ShopLogo logoUrl={logoUrl} size="md" />
                    </Stack>

                    <Box sx={{ flex: 1, display: { xs: "none", lg: "block" }, px: { lg: 2, xl: 3 } }}>
                      <HeaderSearch />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{ display: { xs: "none", lg: "flex" }, flexShrink: 0, alignItems: "center" }}
                    >
                      <Box
                        component="a"
                        href={`tel:${CONTACT_PHONE}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          textDecoration: "none",
                          color: "inherit",
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "rgba(15,23,42,0.08)",
                          bgcolor: "grey.50",
                          transition: "border-color 0.2s ease, background-color 0.2s ease",
                          "&:hover": {
                            borderColor: "primary.light",
                            bgcolor: "primary.50",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            flexShrink: 0,
                          }}
                        >
                          <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", lineHeight: 1.2 }}
                          >
                            Contact us
                          </Typography>
                          <Typography variant="body2" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>
                            {CONTACT_PHONE}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ display: { xs: "flex", lg: "none" }, ml: "auto", alignItems: "center" }}
                    >
                      <IconButton
                        aria-label="WhatsApp"
                        onClick={() => window.open(`https://wa.me/${whatsappPhone}`, "_blank")}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.25,
                          bgcolor: "rgba(37,211,102,0.1)",
                          color: "#128C7E",
                        }}
                      >
                        <WhatsAppIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        aria-label="Wishlist"
                        onClick={() => setWishlistOpen(true)}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.25,
                          bgcolor: "grey.50",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Badge badgeContent={wishlistCount} color="primary" max={9}>
                          <FavoriteBorderRoundedIcon sx={{ fontSize: 18 }} />
                        </Badge>
                      </IconButton>
                      <IconButton
                        aria-label="Cart"
                        onClick={() => setCartOpen(true)}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.25,
                          bgcolor: "grey.50",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Badge badgeContent={cartCount} color="primary" max={9}>
                          <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                        </Badge>
                      </IconButton>
                      <IconButton
                        aria-label="Menu"
                        onClick={() => setMenuOpen(true)}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.25,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <MenuRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Toolbar>
                </StoreContainer>

                <Box
                  component="nav"
                  aria-label="Shop categories"
                  sx={{
                    background: (theme) =>
                      `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "primary.contrastText",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  <StoreContainer>
                    <Stack direction="row" spacing={1} sx={{ py: 0.85, alignItems: "center", gap: 1 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          overflowX: "auto",
                          scrollbarWidth: "none",
                          "&::-webkit-scrollbar": { display: "none" },
                          alignItems: "center",
                        }}
                      >
                        <CategoryNavButtons
                          pathname={pathname}
                          activeCategorySlug={activeCategorySlug}
                          categories={categories}
                          isLoading={isLoading}
                          tone="onPrimary"
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          display: { xs: "none", sm: "flex" },
                          flexShrink: 0,
                          pl: 1.5,
                          ml: 0.5,
                          borderLeft: "1px solid rgba(255,255,255,0.22)",
                          alignItems: "center",
                        }}
                      >
                        <ActionIconButton
                          label="Wishlist"
                          onClick={() => setWishlistOpen(true)}
                          badgeContent={wishlistCount}
                          sx={{ display: { xs: "none", lg: "inline-flex" } }}
                        >
                          <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Cart"
                          onClick={() => setCartOpen(true)}
                          badgeContent={cartCount}
                          sx={{ display: { xs: "none", lg: "inline-flex" } }}
                        >
                          <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                        </ActionIconButton>
                        <Button
                          component={Link}
                          href="/orders-traking"
                          size="small"
                          startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: "18px !important" }} />}
                          sx={{
                            display: { xs: "none", sm: "inline-flex" },
                            bgcolor: "common.white",
                            color: "primary.main",
                            borderRadius: 1.25,
                            px: 1.75,
                            py: 0.75,
                            fontWeight: 700,
                            fontSize: 13,
                            boxShadow: "0 6px 16px -8px rgba(15,23,42,0.45)",
                            "&:hover": { bgcolor: "grey.50", color: "primary.dark" },
                          }}
                        >
                          Track order
                        </Button>
                      </Stack>
                    </Stack>
                  </StoreContainer>
                </Box>
              </Box>
            </Box>
          ) : null}
        </AnimatePresence>
      </Box>

      <AnimatePresence>
        {scrolled ? (
          <Box
            component={motion.header}
            key="compact-nav"
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={NAV_TRANSITION}
            sx={{
              position: "fixed",
              top: { xs: 10, sm: 14 },
              left: 0,
              right: 0,
              zIndex: (theme) => theme.zIndex.appBar,
              px: { xs: 1.25, sm: 2, md: 2.5 },
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          >
            <Box
              sx={{
                pointerEvents: "auto",
                mx: "auto",
                width: 1,
                maxWidth: { xs: 720, sm: 960, md: 1120, lg: 1200 },
                bgcolor: "background.paper",
                borderRadius: 999,
                border: "1px solid",
                borderColor: "rgba(15,23,42,0.08)",
                boxShadow: "0 12px 40px -16px rgba(15,23,42,0.28), 0 4px 12px -6px rgba(15,23,42,0.12)",
                overflow: "hidden",
              }}
            >
              <StoreContainer>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    py: 0.75,
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5 },
                  }}
                >
                  <Stack
                    component={Link}
                    href="/"
                    direction="row"
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      flexShrink: 0,
                      flex: 1,
                      minWidth: 0,
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <ShopLogo logoUrl={logoUrl} size="xs" />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      flex: "0 1 auto",
                      minWidth: 0,
                      overflowX: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CategoryNavButtons
                      pathname={pathname}
                      activeCategorySlug={activeCategorySlug}
                      categories={categories}
                      isLoading={isLoading}
                      tone="onSurface"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      flexShrink: 0,
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <ActionIconButton
                      label="Wishlist"
                      onClick={() => setWishlistOpen(true)}
                      badgeContent={wishlistCount}
                      sx={compactIconSx}
                    >
                      <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />
                    </ActionIconButton>
                    <ActionIconButton
                      label="Cart"
                      onClick={() => setCartOpen(true)}
                      badgeContent={cartCount}
                      sx={compactIconSx}
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                    </ActionIconButton>
                    <IconButton
                      aria-label="Menu"
                      onClick={() => setMenuOpen(true)}
                      size="small"
                      sx={{
                        display: { xs: "inline-flex", md: "none" },
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <MenuRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Button
                      component={Link}
                      href="/orders-traking"
                      size="small"
                      startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: "18px !important" }} />}
                      sx={{
                        display: { xs: "none", sm: "inline-flex" },
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderRadius: 999,
                        px: 1.75,
                        py: 0.75,
                        fontWeight: 700,
                        fontSize: 13,
                        boxShadow: "0 6px 16px -8px rgba(15,23,42,0.45)",
                        "&:hover": {
                          bgcolor: "primary.dark",
                          color: "primary.contrastText",
                        },
                      }}
                    >
                      Track order
                    </Button>
                  </Stack>
                </Stack>
              </StoreContainer>
            </Box>
          </Box>
        ) : null}
      </AnimatePresence>

      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              backgroundColor: "rgba(15, 23, 42, 0.28)",
            },
          },
          paper: {
            sx: {
              width: { xs: "min(280px, 78vw)", sm: 300 },
              maxWidth: "78vw",
              height: "100%",
              maxHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: 1, minHeight: 0, overflow: "hidden" }}>
          <Stack
            direction="row"
            sx={{
              px: 2,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight={700}>Menu</Typography>
            <IconButton onClick={() => setMenuOpen(false)} size="small">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={0.5} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {navLinks.map((link) => {
              const active = link.match ? link.match(pathname) : pathname === link.href;
              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    bgcolor: active ? "primary.light" : "transparent",
                    color: active ? "primary.dark" : "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
            <Button
              component={Link}
              href="/categories"
              onClick={() => setMenuOpen(false)}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ justifyContent: "flex-start", color: "primary.main", mt: 1 }}
            >
              All categories
            </Button>
          </Stack>

          <Stack
            spacing={1.5}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              flexShrink: 0,
              pb: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1.25, alignItems: "center" }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  flexShrink: 0,
                }}
              >
                <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Contact
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap>
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
              startIcon={<Inventory2OutlinedIcon />}
            >
              Track your order
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistSidebar open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
