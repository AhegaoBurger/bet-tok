import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MARKET_SORT_OPTIONS,
  type MarketSortOption,
} from "../types/market.types";

interface SortDropdownProps {
  value: MarketSortOption;
  onChange: (option: MarketSortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const handleChange = (selectedValue: string) => {
    const option = MARKET_SORT_OPTIONS.find(
      (opt) => `${opt.value}-${opt.ascending}` === selectedValue
    );
    if (option) {
      onChange(option);
    }
  };

  return (
    <Select
      value={`${value.value}-${value.ascending}`}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {MARKET_SORT_OPTIONS.map((option) => (
          <SelectItem
            key={`${option.value}-${option.ascending}`}
            value={`${option.value}-${option.ascending}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
