import { cn } from "@/lib/utils";
import { type Platform, PLATFORM_CONFIG } from "@/shared/types/platform";

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs rounded-full",
        config.color.bg,
        config.color.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
