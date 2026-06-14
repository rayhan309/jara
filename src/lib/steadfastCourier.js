import { normalizePhone } from "@/lib/orderValidation";
import {
  getSteadfastConfigFromSettings,
  normalizeSteadfastBaseUrl,
} from "@/lib/siteSettings";
import { getFreshSiteSettings } from "@/lib/siteSettingsServer";

async function resolveConfig(override, options = {}) {
  if (override?.apiKey && override?.secretKey) {
    return {
      baseUrl: normalizeSteadfastBaseUrl(override.baseUrl),
      apiKey: String(override.apiKey).trim(),
      secretKey: String(override.secretKey).trim(),
    };
  }

  const settings = await getFreshSiteSettings();
  const config = getSteadfastConfigFromSettings(settings, options);

  if (!config?.apiKey || !config?.secretKey) {
    throw new Error("Steadfast API credentials are not configured.");
  }

  return config;
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

async function steadfastRequest(path, options = {}, configOverride) {
  const { apiKey, secretKey, baseUrl } = await resolveConfig(configOverride, {
    requireEnabled: !configOverride,
  });
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
  const data = await steadfastRequest(
    "create_order",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    null
  );

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

export async function getSteadfastBalance(configOverride) {
  return steadfastRequest("get_balance", { method: "GET" }, configOverride);
}

export async function testSteadfastConnection(configOverride) {
  return getSteadfastBalance(configOverride);
}
