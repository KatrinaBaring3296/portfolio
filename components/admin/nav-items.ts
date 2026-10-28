import {
  Award,
  Briefcase,
  CircleHelp,
  FolderKanban,
  Inbox,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserRoundCog,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

// The admin sidebar, top to bottom.
export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/profiles", label: "Profiles", icon: UserRoundCog },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/certificates", label: "Certifications", icon: Award },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
];
