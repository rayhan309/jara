import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: XIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
  tiktok: MusicNoteIcon,
  linkedin: LinkedInIcon,
};

export function getSocialIcon(platform) {
  return ICONS[platform] || FacebookIcon;
}

export function getActiveSocialLinks(settings) {
  return (settings?.socialLinks || []).filter(
    (link) => link.enabled && String(link.url || "").trim()
  );
}
