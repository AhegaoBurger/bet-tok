import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Platform, PLATFORM_CONFIG } from "@/shared/types/platform";

export type PlatformFilterValue = Platform | "all";

interface PlatformFilterProps {
  value: PlatformFilterValue;
  onChange: (value: PlatformFilterValue) => void;
}

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="All Platforms" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Platforms</SelectItem>
        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => (
          <SelectItem key={platform} value={platform}>
            {PLATFORM_CONFIG[platform].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
