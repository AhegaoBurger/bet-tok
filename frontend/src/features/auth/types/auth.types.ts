export interface AuthState {
  isConnected: boolean;
  isInitializing: boolean;
  address: string | null;
  fid: number | null;
}

export interface RouterAuthContext {
  isConnected: boolean;
  address: string | null;
  fid: number | null;
}
