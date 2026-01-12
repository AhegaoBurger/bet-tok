import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, type ApiEndpoint } from "../types/api-explorer.types";

interface EndpointSelectorProps {
  value: string;
  onChange: (endpoint: ApiEndpoint) => void;
}

export function EndpointSelector({ value, onChange }: EndpointSelectorProps) {
  const handleChange = (id: string) => {
    const endpoint = API_ENDPOINTS.find((e) => e.id === id);
    if (endpoint) {
      onChange(endpoint);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Endpoint</label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an endpoint" />
        </SelectTrigger>
        <SelectContent>
          {API_ENDPOINTS.map((endpoint) => (
            <SelectItem key={endpoint.id} value={endpoint.id}>
              <span className="font-mono text-xs text-primary mr-2">
                {endpoint.method}
              </span>
              {endpoint.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
