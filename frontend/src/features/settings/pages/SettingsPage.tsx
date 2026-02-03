import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCredentials } from "../hooks/useCredentials";
import {
  OpinionApiKeyForm,
  KalshiCredentialsForm,
  WalletStatus,
} from "../components";

export function SettingsPage() {
  const {
    credentials,
    setOpinionCredentials,
    setKalshiCredentials,
    clearAllCredentials,
    hasOpinionCredentials,
    hasKalshiCredentials,
  } = useCredentials();

  const hasAnyCredentials = hasOpinionCredentials || hasKalshiCredentials;

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your API credentials and wallet connections for prediction market platforms.
          </p>
        </div>

        <Alert>
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            Your credentials are stored locally in your browser and are obfuscated.
            For sensitive trading operations, consider using a hardware wallet
            and never share your private keys.
          </AlertDescription>
        </Alert>

        <WalletStatus />

        <OpinionApiKeyForm
          credentials={credentials.opinion}
          onSave={setOpinionCredentials}
        />

        <KalshiCredentialsForm
          credentials={credentials.kalshi}
          onSave={setKalshiCredentials}
        />

        {hasAnyCredentials && (
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all stored credentials?"
                  )
                ) {
                  clearAllCredentials();
                }
              }}
            >
              Clear All Credentials
            </Button>
          </div>
        )}

        <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
          <h3 className="font-medium text-foreground">Credential Status</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasOpinionCredentials ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              Opinion API Key: {hasOpinionCredentials ? "Configured" : "Not set"}
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasKalshiCredentials ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              Kalshi Credentials: {hasKalshiCredentials ? "Configured" : "Not set"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
