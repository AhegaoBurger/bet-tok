import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_SORT_OPTIONS, type EventSortOption } from "../types/event.types";

interface EventSortDropdownProps {
  value: EventSortOption;
  onChange: (option: EventSortOption) => void;
}

export function EventSortDropdown({ value, onChange }: EventSortDropdownProps) {
  const handleChange = (selectedValue: string) => {
    const option = EVENT_SORT_OPTIONS.find(
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
        {EVENT_SORT_OPTIONS.map((option) => (
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
