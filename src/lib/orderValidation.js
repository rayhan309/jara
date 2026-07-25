import { FREE_DELIVERY_OPTION_ID, getDeliveryAreas } from "@/lib/shipping";

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
const NAME_REGEX = /^[\p{L}\s.'-]{2,80}$/u;

export function normalizePhone(raw) {
  return String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

export function isValidBdPhone(phone) {
  return BD_PHONE_REGEX.test(normalizePhone(phone));
}

export function validateCustomerDetails({ name, phone, address }) {
  const errors = {};
  const trimmedName = String(name || "").trim();
  const normalizedPhone = normalizePhone(phone);
  const trimmedAddress = String(address || "").trim();

  if (!trimmedName) {
    errors.name = "Please enter your name";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (!NAME_REGEX.test(trimmedName)) {
    errors.name = "Please enter a valid name (letters only)";
  }

  if (!normalizedPhone) {
    errors.phone = "Please enter your phone number";
  } else if (!isValidBdPhone(normalizedPhone)) {
    errors.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)";
  }

  if (!trimmedAddress) {
    errors.address = "Please enter your address";
  } else if (trimmedAddress.length < 10) {
    errors.address = "Enter a complete address (at least 10 characters)";
  } else if (trimmedAddress.length > 500) {
    errors.address = "Address cannot exceed 500 characters";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: {
      name: trimmedName,
      phone: normalizedPhone,
      address: trimmedAddress,
    },
  };
}

export function validateDeliveryMethod(delivery, settings) {
  if (delivery === FREE_DELIVERY_OPTION_ID) {
    return {
      ok: true,
      delivery,
      area: { id: FREE_DELIVERY_OPTION_ID, label: "Free delivery" },
    };
  }

  const areas = getDeliveryAreas(settings);
  const match = areas.find((area) => area.id === delivery);
  if (!match) {
    return { ok: false, error: "Please select a delivery method" };
  }
  return { ok: true, delivery, area: match };
}

export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Your cart is empty" };
  }

  for (const item of items) {
    if (!item?._id) {
      return { ok: false, error: "Invalid product information" };
    }
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
      return { ok: false, error: "Invalid product quantity" };
    }
  }

  return { ok: true };
}
