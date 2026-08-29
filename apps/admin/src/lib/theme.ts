import type { CSSProperties } from "react";
import type { ThemeConfig } from "antd";
import type { TicketStatus, TicketPriority } from "@repo/shared";

/* ------------------------------------------------------------------ */
/*  HelpDesk Live — Admin console design tokens                        */
/*  Mirrors apps/web's neobrutalism language (globals.css @theme):     */
/*  warm off-white ground, pure-ish black ink, one 6px radius,         */
/*  saturated accents, hard zero-blur offset shadows.                  */
/*  antd token system covers color/radius/font; the hard shadows and   */
/*  press effect live in index.css (antd tokens can't express them).   */
/* ------------------------------------------------------------------ */

export const COLORS = {
  cream: "#FFFCF5", // page background
  paper: "#FFFFFF", // raised surfaces
  ink: "#0A0A0A", // borders + text
  muted: "#6B6B6B", // secondary text only, never borders
  brandYellow: "#FFD23F",
  brandBlue: "#2D6BFF",
  brandPink: "#FF5CA8",
  danger: "#E5484D",
  success: "#1F9E5A",
} as const;

/** Signature hard shadow — offset, zero blur. Kept in JS so inline
 *  styles (e.g. Popover/Dropdown panels) can reuse the exact value. */
export const BRUT_SHADOW = `4px 4px 0 0 ${COLORS.ink}`;
export const BRUT_SHADOW_SM = `2px 2px 0 0 ${COLORS.ink}`;

export const BORDER_WIDTH = 2; // antd default hairline → visibly bold
export const RADIUS = 6; // single radius value, matches web

export const FONT_DISPLAY =
  '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';
export const FONT_SANS =
  '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif';

/* ---- Status / priority tag colors -------------------------------- */
/*  Saturated, not pastel — same hex values as web's --color-status-*. */

type TagMeta = { label: string; color: string };

export const STATUS_META: Record<TicketStatus, TagMeta> = {
  open: { label: "Open", color: "#FF7A1A" }, // solid orange
  inProgress: { label: "In progress", color: "#2D6BFF" }, // solid blue
  resolved: { label: "Resolved", color: "#1F9E5A" }, // solid green
  closed: { label: "Closed", color: "#6B7280" }, // solid gray
};

export const PRIORITY_META: Record<TicketPriority, TagMeta> = {
  low: { label: "Low", color: "#9CA3AF" },
  normal: { label: "Normal", color: "#2D6BFF" },
  high: { label: "High", color: "#E5484D" },
};

/** Pick black or white text for a given solid background hex. */
export function readableInk(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? COLORS.ink : "#FFFFFF";
}

/** Shared bold-bordered saturated Tag style. */
export function brutTagStyle(bg: string): CSSProperties {
  return {
    background: bg,
    color: readableInk(bg),
    border: `2px solid ${COLORS.ink}`,
    borderRadius: RADIUS,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "18px",
    padding: "1px 8px",
    margin: 0,
  };
}

/* ---- antd ConfigProvider theme --------------------------------- */

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: COLORS.brandBlue,
    colorInfo: COLORS.brandBlue,
    colorSuccess: COLORS.success,
    colorError: COLORS.danger,
    colorTextBase: COLORS.ink,
    colorBorder: COLORS.ink,
    colorBorderSecondary: COLORS.ink,
    colorBgLayout: COLORS.cream,
    colorBgContainer: COLORS.paper,
    colorBgElevated: COLORS.paper,
    borderRadius: RADIUS,
    borderRadiusLG: RADIUS,
    borderRadiusSM: RADIUS,
    lineWidth: BORDER_WIDTH,
    fontFamily: FONT_SANS,
    fontWeightStrong: 700,
    boxShadow: BRUT_SHADOW,
    boxShadowSecondary: BRUT_SHADOW,
    controlHeight: 38,
  },
  components: {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      fontWeight: 600,
      controlHeight: 38,
    },
    Card: {
      lineWidth: BORDER_WIDTH,
      borderRadiusLG: RADIUS,
    },
    Input: { lineWidth: BORDER_WIDTH, activeShadow: "none" },
    InputNumber: { lineWidth: BORDER_WIDTH },
    Select: { lineWidth: BORDER_WIDTH },
    Table: {
      lineWidth: BORDER_WIDTH,
      headerBg: COLORS.brandYellow,
      headerColor: COLORS.ink,
      headerBorderRadius: 0,
      borderColor: COLORS.ink,
    },
    Menu: {
      itemBorderRadius: RADIUS,
      itemSelectedBg: COLORS.brandYellow,
      itemSelectedColor: COLORS.ink,
      itemHeight: 42,
    },
    Layout: {
      siderBg: COLORS.paper,
      headerBg: COLORS.paper,
      headerHeight: 64,
      headerPadding: "0 20px",
      bodyBg: COLORS.cream,
    },
    Modal: { contentBg: COLORS.paper, headerBg: COLORS.paper },
    Drawer: { colorBgElevated: COLORS.paper },
    Tag: { borderRadiusSM: RADIUS },
  },
};
