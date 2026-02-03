export interface OpinionCredentials {
  apiKey: string;
}

export interface KalshiCredentials {
  apiKeyId: string;
  privateKey: string; // PEM format
}

export interface StoredCredentials {
  opinion?: OpinionCredentials;
  kalshi?: KalshiCredentials;
}

export interface CredentialValidationResult {
  valid: boolean;
  error?: string;
}
