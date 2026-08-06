/**
 * Bangladesh divisions (regions) and districts for checkout delivery detection.
 * Dhaka district → inside Dhaka delivery; all others → outside Dhaka.
 */

export const BD_REGIONS = [
  {
    name: "Dhaka",
    districts: [
      "Dhaka",
      "Faridpur",
      "Gazipur",
      "Gopalganj",
      "Kishoreganj",
      "Madaripur",
      "Manikganj",
      "Munshiganj",
      "Narayanganj",
      "Narsingdi",
      "Rajbari",
      "Shariatpur",
      "Tangail",
    ],
  },
  {
    name: "Chattogram",
    districts: [
      "Bandarban",
      "Brahmanbaria",
      "Chandpur",
      "Chattogram",
      "Cox's Bazar",
      "Cumilla",
      "Feni",
      "Khagrachhari",
      "Lakshmipur",
      "Noakhali",
      "Rangamati",
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      "Bogura",
      "Chapainawabganj",
      "Joypurhat",
      "Naogaon",
      "Natore",
      "Pabna",
      "Rajshahi",
      "Sirajganj",
    ],
  },
  {
    name: "Khulna",
    districts: [
      "Bagerhat",
      "Chuadanga",
      "Jashore",
      "Jhenaidah",
      "Khulna",
      "Kushtia",
      "Magura",
      "Meherpur",
      "Narail",
      "Satkhira",
    ],
  },
  {
    name: "Barishal",
    districts: ["Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"],
  },
  {
    name: "Sylhet",
    districts: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  },
  {
    name: "Rangpur",
    districts: [
      "Dinajpur",
      "Gaibandha",
      "Kurigram",
      "Lalmonirhat",
      "Nilphamari",
      "Panchagarh",
      "Rangpur",
      "Thakurgaon",
    ],
  },
  {
    name: "Mymensingh",
    districts: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  },
];

export const INSIDE_DHAKA_DISTRICT = "Dhaka";

export function getRegionNames() {
  return BD_REGIONS.map((region) => region.name);
}

export function getDistrictsForRegion(regionName) {
  const region = BD_REGIONS.find((entry) => entry.name === regionName);
  return region?.districts || [];
}

export function isValidRegion(regionName) {
  return BD_REGIONS.some((entry) => entry.name === regionName);
}

export function isValidDistrict(regionName, districtName) {
  return getDistrictsForRegion(regionName).includes(districtName);
}

/** Only Dhaka district counts as inside-Dhaka delivery. */
export function isInsideDhakaDistrict(districtName) {
  return String(districtName || "").trim() === INSIDE_DHAKA_DISTRICT;
}

/**
 * Pick delivery area id from cart options using district.
 * Falls back to first/second option if custom area ids are configured.
 */
export function resolveDeliveryAreaFromDistrict(districtName, deliveryOptions = []) {
  if (!deliveryOptions.length) return "";

  const free = deliveryOptions.find((option) => option.isFree);
  if (free) return free.id;

  const inside =
    deliveryOptions.find((option) => option.id === "inside_dhaka") ||
    deliveryOptions.find((option) => /inside/i.test(option.label || ""));
  const outside =
    deliveryOptions.find((option) => option.id === "outside_dhaka") ||
    deliveryOptions.find((option) => /outside/i.test(option.label || ""));

  if (isInsideDhakaDistrict(districtName)) {
    return inside?.id || deliveryOptions[0].id;
  }

  return outside?.id || deliveryOptions[1]?.id || deliveryOptions[0].id;
}
