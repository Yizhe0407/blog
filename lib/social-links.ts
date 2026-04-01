import {
  Github,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yizhe-liao", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/Yizhe0407", icon: Github },
  { label: "Email", href: "mailto:liaoyizhe75@gmail.com", icon: Mail },
  { label: "Instagram", href: "https://www.instagram.com/roger_0407/", icon: Instagram },
];
