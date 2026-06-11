import { normalizePhone } from "@/lib/orderValidation";

const DEFAULT_BASE_URL = "https://portal.packzy.com/api/v1";

function getConfig() {
  const apiKey = process.env.STEADFAST_API_KEY;
  const secretKey = process.env.STEADFAST_SECRET_KEY;
  const baseUrl = (process.env.STEADFAST_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

  if (!apiKey || !secretKey) {
    throw new Error("Steadfast API credentials are not configured.");
  }

  return { apiKey, secretKey, baseUrl };
}

function sanitizeInvoice(value, fallback) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");

  return cleaned || fallback;
}

function truncate(value, max) {
  return String(value || "").trim().slice(0, max);
}

export function mapOrderToSteadfastPayload(order) {
  const phone = normalizePhone(order?.customer?.phone);

  if (!phone || phone.length !== 11) {
    throw new Error("Valid 11-digit recipient phone is required.");
  }

  const name = truncate(order?.customer?.name, 100);
  const address = truncate(order?.customer?.address, 250);

  if (!name) throw new Error("Recipient name is required.");
  if (!address) throw new Error("Recipient address is required.");

  const codAmount = Number(order?.pricing?.total ?? 0);
  if (!Number.isFinite(codAmount) || codAmount < 0) {
    throw new Error("Invalid COD amount.");
  }

  const items = order?.items || [];
  const totalLot = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemDescription = items
    .map((item) => {
      const variant = item.selected_variant ? ` (${item.selected_variant})` : "";
      return `${item.title}${variant} x${item.quantity}`;
    })
    .join(", ");

  const invoice = sanitizeInvoice(order?.order_number, `order-${order?._id}`);

  return {
    invoice,
    recipient_name: name,
    recipient_phone: phone,
    recipient_address: address,
    cod_amount: codAmount,
    note: truncate(order?.delivery?.label || order?.customer?.delivery_area, 200) || undefined,
    item_description: truncate(itemDescription, 250) || undefined,
    total_lot: totalLot > 0 ? totalLot : undefined,
    delivery_type: 0,
  };
}

async function steadfastRequest(path, options = {}) {
  const { apiKey, secretKey, baseUrl } = getConfig();
  const url = `${baseUrl}/${String(path).replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
      "Secret-Key": secretKey,
      ...(options.headers || {}),
    },
  });

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (!response.ok) {
        throw new Error(rawBody.trim() || `Steadfast API error (${response.status})`);
      }
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      rawBody?.trim() ||
      `Steadfast API error (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function createSteadfastOrder(order) {
  const payload = mapOrderToSteadfastPayload(order);
  const data = await steadfastRequest("create_order", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const consignment = data?.consignment || data?.data?.consignment || {};

  return {
    payload,
    response: data,
    consignment: {
      consignment_id: consignment.consignment_id ?? consignment.id ?? null,
      tracking_code: consignment.tracking_code ?? consignment.trackingCode ?? null,
      invoice: consignment.invoice ?? payload.invoice,
      status: consignment.status ?? null,
    },
  };
}

export async function getSteadfastBalance() {
  return steadfastRequest("get_balance", { method: "GET" });
}
