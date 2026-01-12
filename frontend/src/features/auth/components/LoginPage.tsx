import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { APP_NAME } from "@/shared/constants";

interface LoginSearch {
  returnTo?: string;
}

export function LoginPage() {
  const { isConnected, isInitializing, connect } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" }) as LoginSearch;

  useEffect(() => {
    if (isConnected) {
      const returnTo = search.returnTo || "/";
      navigate({ to: returnTo });
    }
  }, [isConnected, navigate, search.returnTo]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to {APP_NAME}</CardTitle>
          <CardDescription>
            Connect your wallet to access personalized features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={connect}
            className="w-full"
            size="lg"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Connect Wallet
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This app works best within the Farcaster or Base app.
            Connect using your Farcaster account or Base wallet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
