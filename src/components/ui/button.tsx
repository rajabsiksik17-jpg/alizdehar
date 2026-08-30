import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { Icon } from "@/components/icon";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "white";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-800 text-white hover:bg-brand-700 shadow-soft hover:shadow-lift",
  secondary:
    "bg-accent-500 text-brand-950 hover:bg-accent-400 shadow-soft hover:shadow-lift",
  ghost: "text-brand-800 hover:bg-brand-50",
  outline:
    "border border-brand-200 text-brand-800 hover:border-brand-400 hover:bg-brand-50",
  white: "bg-white text-brand-900 hover:bg-brand-50 shadow-soft",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  locale?: Locale;
  icon?: string;
  iconEnd?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">;

export function Button({
  variant = "primary",
  size = "md",
  href: hrefProp,
  locale,
  icon,
  iconEnd,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      {icon ? <Icon name={icon} className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
      {iconEnd ? <Icon name={iconEnd} className="h-4 w-4 shrink-0" /> : null}
    </>
  );

  if (hrefProp) {
    const to = hrefProp && locale ? href(locale, hrefProp) : hrefProp;
    const external = /^(https?:\/\/|mailto:|tel:)/.test(hrefProp);
    if (external) {
      return (
        <a href={hrefProp} className={classes} {...(props as Record<string, unknown>)}>
          {content}
        </a>
      );
    }
    return (
      <Link href={to!} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
