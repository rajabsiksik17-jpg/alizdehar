import Link from "next/link";
import type { ComponentProps } from "react";
import type { Locale } from "@/lib/i18n/config";
import { href } from "@/lib/site";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  locale: Locale;
  href: string;
};

/** Locale-aware <Link> — pass a locale-agnostic path. */
export function LocaleLink({ locale, href: path, className, ...props }: Props) {
  return <Link href={href(locale, path)} className={className} {...props} />;
}
