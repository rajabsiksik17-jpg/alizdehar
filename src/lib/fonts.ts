import { Cairo } from "next/font/google";

/**
 * Single global font configuration — Cairo for both Arabic (RTL) and
 * English (LTR). Import this object in every root layout so the font is
 * loaded once and reused consistently across the whole app.
 */
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});
