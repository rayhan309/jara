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
    errors.name = "আপনার নাম লিখুন";
  } else if (trimmedName.length < 2) {
    errors.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে";
  } else if (!NAME_REGEX.test(trimmedName)) {
    errors.name = "সঠিক নাম লিখুন (শুধু অক্ষর)";
  }

  if (!normalizedPhone) {
    errors.phone = "ফোন নাম্বার লিখুন";
  } else if (!isValidBdPhone(normalizedPhone)) {
    errors.phone = "সঠিক বাংলাদেশি মোবাইল নাম্বার দিন (01XXXXXXXXX)";
  }

  if (!trimmedAddress) {
    errors.address = "আপনার ঠিকানা লিখুন";
  } else if (trimmedAddress.length < 10) {
    errors.address = "সম্পূর্ণ ঠিকানা লিখুন (কমপক্ষে ১০ অক্ষর)";
  } else if (trimmedAddress.length > 500) {
    errors.address = "ঠিকানা ৫০০ অক্ষরের বেশি হতে পারবে না";
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
      area: { id: FREE_DELIVERY_OPTION_ID, label: "ফ্রী ডেলিভারি" },
    };
  }

  const areas = getDeliveryAreas(settings);
  const match = areas.find((area) => area.id === delivery);
  if (!match) {
    return { ok: false, error: "ডেলিভারি মেথড বেছে নিন" };
  }
  return { ok: true, delivery, area: match };
}

export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "কার্টে কোনো পণ্য নেই" };
  }

  for (const item of items) {
    if (!item?._id) {
      return { ok: false, error: "অবৈধ পণ্য তথ্য" };
    }
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
      return { ok: false, error: "পণ্যের পরিমাণ সঠিক নয়" };
    }
  }

  return { ok: true };
}
