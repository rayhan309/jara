import { DEFAULT_SETTINGS } from "@/lib/siteSettings";

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

export function buildDeliveryOptions(items = [], settings = DEFAULT_SETTINGS) {
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
