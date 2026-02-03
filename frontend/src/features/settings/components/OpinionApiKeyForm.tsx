import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OpinionCredentials } from "../types/credentials.types";

interface OpinionApiKeyFormProps {
  credentials?: OpinionCredentials;
  onSave: (credentials: OpinionCredentials | null) => void;
}

export function OpinionApiKeyForm({ credentials, onSave }: OpinionApiKeyFormProps) {
  const [apiKey, setApiKey] = useState(credentials?.apiKey || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      onSave(null);
      setValidationStatus("idle");
      return;
    }

    setIsValidating(true);
    setError(null);

    // Validate by making a test request
    try {
      // For now, just save the key - validation can be added when we have authenticated endpoints
      onSave({ apiKey: apiKey.trim() });
      setValidationStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setValidationStatus("error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKey("");
    onSave(null);
    setValidationStatus("idle");
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold">
            O
          </span>
          Opinion Protocol
        </CardTitle>
        <CardDescription>
          Configure your Opinion API key for authenticated access on BNB Chain.
          Get your API key from{" "}
          <a
            href="https://opinion.trade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            opinion.trade
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="opinion-api-key">API Key</Label>
          <Input
            id="opinion-api-key"
            type="password"
            placeholder="Enter your Opinion API key"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setValidationStatus("idle");
            }}
          />
        </div>

        {validationStatus === "success" && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200">
              API key saved successfully.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === "error" && error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isValidating}>
            {isValidating ? "Validating..." : "Save API Key"}
          </Button>
          {credentials?.apiKey && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
