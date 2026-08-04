export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  SHOP_MANAGER: "shop_manager",
  MODERATOR: "moderator",
};

export const ADMIN_ROLE_OPTIONS = [
  { value: ADMIN_ROLES.SUPER_ADMIN, label: "Super Admin" },
  { value: ADMIN_ROLES.SHOP_MANAGER, label: "Shop Manager" },
  { value: ADMIN_ROLES.MODERATOR, label: "Moderator" },
];

export const PERMISSIONS = {
  OVERVIEW: "overview",
  ORDERS: "orders",
  PRODUCTS: "products",
  CUSTOMERS: "customers",
  SETTINGS: "settings",
  USERS: "users",
  ACCOUNT: "account",
  REPORTS: "reports",
};

const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ADMIN_ROLES.SHOP_MANAGER]: [
    PERMISSIONS.OVERVIEW,
    PERMISSIONS.PRODUCTS,
    PERMISSIONS.CUSTOMERS,
    PERMISSIONS.ACCOUNT,
  ],
  [ADMIN_ROLES.MODERATOR]: [PERMISSIONS.ORDERS, PERMISSIONS.REPORTS, PERMISSIONS.ACCOUNT],
};

export function getRoleLabel(role) {
  return ADMIN_ROLE_OPTIONS.find((entry) => entry.value === role)?.label || role;
}

export function hasPermission(role, permission) {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function getDefaultDashboardPath(role) {
  if (role === ADMIN_ROLES.MODERATOR) return "/dashboard/orders";
  if (role === ADMIN_ROLES.SHOP_MANAGER) return "/dashboard/products";
  return "/dashboard";
}

export function canAccessDashboardPath(role, pathname) {
  if (!role) return false;
  if (pathname.startsWith("/dashboard/account")) return true;

  if (pathname.startsWith("/dashboard/users")) {
    return hasPermission(role, PERMISSIONS.USERS);
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return hasPermission(role, PERMISSIONS.SETTINGS);
  }

  if (pathname.startsWith("/dashboard/orders")) {
    return hasPermission(role, PERMISSIONS.ORDERS);
  }

  if (pathname.startsWith("/dashboard/reports")) {
    return hasPermission(role, PERMISSIONS.REPORTS) || hasPermission(role, PERMISSIONS.ORDERS);
  }

  if (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories")
  ) {
    return hasPermission(role, PERMISSIONS.PRODUCTS);
  }

  if (pathname.startsWith("/dashboard/customers")) {
    return hasPermission(role, PERMISSIONS.CUSTOMERS);
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return hasPermission(role, PERMISSIONS.OVERVIEW);
  }

  return hasPermission(role, PERMISSIONS.OVERVIEW);
}

export function getNavItemsForRole(role) {
  const items = [];

  if (hasPermission(role, PERMISSIONS.OVERVIEW)) {
    items.push({ type: "link", href: "/dashboard", label: "Overview", icon: "overview" });
  }

  if (hasPermission(role, PERMISSIONS.ORDERS)) {
    items.push({ type: "link", href: "/dashboard/orders", label: "Orders", icon: "orders" });
  }

  if (hasPermission(role, PERMISSIONS.PRODUCTS)) {
    items.push({
      type: "group",
      label: "Products",
      icon: "products",
      match: (pathname) =>
        pathname.startsWith("/dashboard/products") || pathname.startsWith("/dashboard/categories"),
      children: [
        { href: "/dashboard/products", label: "Products", icon: "products" },
        { href: "/dashboard/products/attributes", label: "Attributes", icon: "attributes" },
        { href: "/dashboard/categories", label: "Categories", icon: "categories" },
      ],
    });
  }

  if (hasPermission(role, PERMISSIONS.CUSTOMERS)) {
    items.push({ type: "link", href: "/dashboard/customers", label: "Customers", icon: "customers" });
  }

  if (hasPermission(role, PERMISSIONS.SETTINGS)) {
    items.push({
      type: "group",
      label: "Settings",
      icon: "settings",
      match: (pathname) => pathname.startsWith("/dashboard/settings"),
      children: [
        { href: "/dashboard/settings/general", label: "General", icon: "palette" },
        { href: "/dashboard/settings/pixel", label: "Meta Pixel", icon: "target" },
        { href: "/dashboard/settings/steadfast", label: "Steadfast", icon: "truck" },
        { href: "/dashboard/settings/shipping", label: "Shipping", icon: "truck" },
        { href: "/dashboard/settings/contact", label: "Contact", icon: "mail" },
        { href: "/dashboard/settings/banners", label: "Hero Banners", icon: "image" },
        { href: "/dashboard/settings/reviews", label: "Client Reviews", icon: "reviews" },
      ],
    });
  }

  if (hasPermission(role, PERMISSIONS.REPORTS) || hasPermission(role, PERMISSIONS.ORDERS)) {
    items.push({
      type: "group",
      label: "Reports",
      icon: "reports",
      match: (pathname) => pathname.startsWith("/dashboard/reports"),
      children: [
        {
          href: "/dashboard/reports/repeat-customers",
          label: "Repeat Customers",
          icon: "reports",
        },
      ],
    });
  }

  if (hasPermission(role, PERMISSIONS.USERS)) {
    items.push({ type: "link", href: "/dashboard/users", label: "Users", icon: "users" });
  }

  items.push({ type: "link", href: "/dashboard/account", label: "My Account", icon: "account" });

  return items;
}
