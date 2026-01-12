import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ApiEndpoint } from "../types/api-explorer.types";

interface ParameterFormProps {
  endpoint: ApiEndpoint;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function ParameterForm({
  endpoint,
  values,
  onChange,
}: ParameterFormProps) {
  if (endpoint.parameters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This endpoint has no parameters.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {endpoint.parameters.map((param) => (
        <div key={param.name} className="space-y-2">
          <Label htmlFor={param.name} className="flex items-center gap-2">
            {param.name}
            {param.required && <span className="text-destructive">*</span>}
            <span className="text-xs text-muted-foreground font-normal">
              ({param.type})
            </span>
          </Label>

          {param.type === "boolean" ? (
            <div className="flex items-center gap-2">
              <Switch
                id={param.name}
                checked={values[param.name] === "true"}
                onCheckedChange={(checked) =>
                  onChange(param.name, checked ? "true" : "")
                }
              />
              <span className="text-sm text-muted-foreground">
                {values[param.name] === "true" ? "true" : "false"}
              </span>
            </div>
          ) : (
            <Input
              id={param.name}
              type={param.type === "number" ? "number" : "text"}
              placeholder={param.placeholder}
              value={values[param.name] || ""}
              onChange={(e) => onChange(param.name, e.target.value)}
            />
          )}

          <p className="text-xs text-muted-foreground">{param.description}</p>
        </div>
      ))}
    </div>
  );
}
