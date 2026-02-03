import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Platform, PLATFORM_CONFIG } from "@/shared/types/platform";

interface TradePlatformLinkProps {
  platform: Platform;
  platformUrl: string;
  className?: string;
}

export function TradePlatformLink({
  platform,
  platformUrl,
  className,
}: TradePlatformLinkProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <a
      href={platformUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "h-9 px-3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      Trade on {config.label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
