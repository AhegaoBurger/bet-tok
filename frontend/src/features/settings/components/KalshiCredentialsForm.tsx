import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { KalshiCredentials } from "../types/credentials.types";

interface KalshiCredentialsFormProps {
  credentials?: KalshiCredentials;
  onSave: (credentials: KalshiCredentials | null) => void;
}

export function KalshiCredentialsForm({ credentials, onSave }: KalshiCredentialsFormProps) {
  const [apiKeyId, setApiKeyId] = useState(credentials?.apiKeyId || "");
  const [privateKey, setPrivateKey] = useState(credentials?.privateKey || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!apiKeyId.trim() || !privateKey.trim()) {
      if (!apiKeyId.trim() && !privateKey.trim()) {
        onSave(null);
        setValidationStatus("idle");
        return;
      }
      setError("Both API Key ID and Private Key are required");
      setValidationStatus("error");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Validate PEM format
      if (!privateKey.includes("-----BEGIN") || !privateKey.includes("-----END")) {
        throw new Error("Private key must be in PEM format");
      }

      onSave({
        apiKeyId: apiKeyId.trim(),
        privateKey: privateKey.trim(),
      });
      setValidationStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
      setValidationStatus("error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setApiKeyId("");
    setPrivateKey("");
    onSave(null);
    setValidationStatus("idle");
    setError(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPrivateKey(content);
      setValidationStatus("idle");
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-bold">
            K
          </span>
          Kalshi
        </CardTitle>
        <CardDescription>
          Configure your Kalshi API credentials for authenticated access.
          Generate API keys from{" "}
          <a
            href="https://kalshi.com/account/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline"
          >
            kalshi.com/account/api
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kalshi-api-key-id">API Key ID</Label>
          <Input
            id="kalshi-api-key-id"
            type="text"
            placeholder="Enter your Kalshi API Key ID"
            value={apiKeyId}
            onChange={(e) => {
              setApiKeyId(e.target.value);
              setValidationStatus("idle");
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kalshi-private-key">Private Key (PEM)</Label>
          <div className="space-y-2">
            <textarea
              id="kalshi-private-key"
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={privateKey}
              onChange={(e) => {
                setPrivateKey(e.target.value);
                setValidationStatus("idle");
              }}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Or upload PEM file:</span>
              <Input
                type="file"
                accept=".pem,.key,.txt"
                onChange={handleFileUpload}
                className="max-w-xs"
              />
            </div>
          </div>
        </div>

        {validationStatus === "success" && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <AlertDescription className="text-green-800 dark:text-green-200">
              Kalshi credentials saved successfully.
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
            {isValidating ? "Validating..." : "Save Credentials"}
          </Button>
          {(credentials?.apiKeyId || credentials?.privateKey) && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
