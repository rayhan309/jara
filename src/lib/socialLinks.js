import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

const ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
};

export function getSocialIcon(platform) {
  return ICONS[platform] || FaFacebookF;
}

export function getActiveSocialLinks(settings) {
  return (settings?.socialLinks || []).filter(
    (link) => link.enabled && String(link.url || "").trim()
  );
}
