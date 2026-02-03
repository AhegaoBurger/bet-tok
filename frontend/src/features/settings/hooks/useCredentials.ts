import { useState, useCallback, useEffect } from "react";
import type {
  StoredCredentials,
  OpinionCredentials,
  KalshiCredentials,
} from "../types/credentials.types";

const STORAGE_KEY = "bet-tok-credentials";

// Simple obfuscation (not true encryption, but prevents casual viewing)
// For production with sensitive data, consider using the Web Crypto API
function encode(data: string): string {
  return btoa(encodeURIComponent(data));
}

function decode(data: string): string {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return "";
  }
}

function loadCredentials(): StoredCredentials {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const decoded = decode(stored);
    return JSON.parse(decoded) as StoredCredentials;
  } catch {
    return {};
  }
}

function saveCredentials(credentials: StoredCredentials): void {
  const encoded = encode(JSON.stringify(credentials));
  localStorage.setItem(STORAGE_KEY, encoded);
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<StoredCredentials>(() =>
    loadCredentials()
  );

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = loadCredentials();
    setCredentials(stored);
  }, []);

  const setOpinionCredentials = useCallback(
    (opinion: OpinionCredentials | null) => {
      setCredentials((prev) => {
        const next = { ...prev };
        if (opinion) {
          next.opinion = opinion;
        } else {
          delete next.opinion;
        }
        saveCredentials(next);
        return next;
      });
    },
    []
  );

  const setKalshiCredentials = useCallback(
    (kalshi: KalshiCredentials | null) => {
      setCredentials((prev) => {
        const next = { ...prev };
        if (kalshi) {
          next.kalshi = kalshi;
        } else {
          delete next.kalshi;
        }
        saveCredentials(next);
        return next;
      });
    },
    []
  );

  const clearAllCredentials = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCredentials({});
  }, []);

  const hasOpinionCredentials = Boolean(credentials.opinion?.apiKey);
  const hasKalshiCredentials = Boolean(
    credentials.kalshi?.apiKeyId && credentials.kalshi?.privateKey
  );

  return {
    credentials,
    setOpinionCredentials,
    setKalshiCredentials,
    clearAllCredentials,
    hasOpinionCredentials,
    hasKalshiCredentials,
  };
}
