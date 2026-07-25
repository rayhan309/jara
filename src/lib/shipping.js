import { DEFAULT_SETTINGS } from "@/lib/siteSettings";

export const FREE_DELIVERY_OPTION_ID = "free_delivery";

export function getDeliveryAreas(settings = DEFAULT_SETTINGS) {
  return settings?.deliveryAreas?.length ? settings.deliveryAreas : DEFAULT_SETTINGS.deliveryAreas;
}

export function getShippingClasses(settings = DEFAULT_SETTINGS) {
  return settings?.shippingClasses?.length ? settings.shippingClasses : DEFAULT_SETTINGS.shippingClasses;
}

export function getShippingClass(settings, classId) {
  const classes = getShippingClasses(settings);
  return classes.find((entry) => entry.id === classId) || classes[0];
}

export function getShippingChargeForClass(shippingClass, areaId) {
  if (!shippingClass) return 0;
  if (shippingClass.freeDelivery) return 0;
  const charge = shippingClass.charges?.[areaId];
  return Math.max(0, Number(charge) || 0);
}

export function isCartFreeDelivery(items = [], settings = DEFAULT_SETTINGS) {
  if (!items.length) return false;

  return items.every((item) => {
    const classId = item.shipping_class || item?.attributes?.shipping_class;
    const shippingClass = getShippingClass(settings, classId);
    return Boolean(shippingClass?.freeDelivery);
  });
}

export function buildDeliveryOptions(items = [], settings = DEFAULT_SETTINGS) {
  if (isCartFreeDelivery(items, settings)) {
    return [
      {
        id: FREE_DELIVERY_OPTION_ID,
        label: "Free delivery",
        charge: 0,
        isFree: true,
      },
    ];
  }

  const deliveryAreas = getDeliveryAreas(settings);
  const defaultClass = getShippingClass(settings);

  return deliveryAreas.map((area) => {
    const charge = items.length
      ? Math.max(
          ...items.map((item) => {
            const classId = item.shipping_class || item?.attributes?.shipping_class;
            const shippingClass = getShippingClass(settings, classId) || defaultClass;
            return getShippingChargeForClass(shippingClass, area.id);
          })
        )
      : getShippingChargeForClass(defaultClass, area.id);

    return {
      id: area.id,
      label: area.label,
      charge,
    };
  });
}
