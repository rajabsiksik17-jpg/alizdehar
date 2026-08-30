import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

type Props = {
  src?: string | null;
  alt?: string;
  icon?: string | null;
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
  imageClassName?: string;
};

/**
 * Image with a branded gradient placeholder fallback when no source
 * is provided (so seed content renders cleanly and remains replaceable).
 */
export function MediaImage({
  src,
  alt = "",
  icon,
  className,
  sizes,
  fill = false,
  priority = false,
  imageClassName,
}: Props) {
  if (src) {
    if (fill) {
      return (
        <div className={cn("relative overflow-hidden", className)}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn("object-cover", imageClassName)}
          />
        </div>
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={800}
        sizes={sizes}
        priority={priority}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950",
        className,
      )}
      role="img"
      aria-label={alt || undefined}
    >
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#fff" strokeWidth="0.5">
            <circle cx="200" cy="150" r="120" />
            <circle cx="200" cy="150" r="80" />
            <circle cx="200" cy="150" r="40" />
            <path d="M80 150H320M200 30V270" />
            <path d="M115 65l170 170M285 65L115 235" opacity="0.6" />
          </g>
        </svg>
      </div>
      {icon ? (
        <Icon name={icon} className="h-12 w-12 text-white/30" />
      ) : null}
    </div>
  );
}
