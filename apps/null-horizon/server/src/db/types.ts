import type { ColumnType } from "kysely";

// Utility types for timestamps
export type Generated<T> = ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

// Auth Schema Tables
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
}

export interface AuthSession {
  id: string;
  expiresAt: Timestamp;
  token: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

export interface AuthAccount {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  password: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
}

export interface AuthVerification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
}

// Asset Schema Tables
export interface AssetAssets {
  id: Generated<string>; // UUID as string
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  symbol: string;
  name: string;
  decimals: number;
}

// Financial Schema Tables
export interface FinancialProviders {
  id: Generated<string>; // UUID as string
  name: string;
  display_name: string;
  oauth_config: Record<string, any>; // JSONB
  is_active: boolean;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface FinancialConnectedAccounts {
  id: Generated<string>; // UUID as string
  user_id: string;
  provider_id: string; // UUID as string

  // Encrypted OAuth data
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  token_expires_at: Timestamp | null;
  refresh_token_expires_at: Timestamp | null;

  // Account metadata
  external_account_id: string;
  account_name: string | null;
  account_type: string | null;

  // Status tracking
  is_active: boolean;
  last_sync_at: Timestamp | null;
  sync_status: string;
  sync_error: string | null;

  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

// Database Interface
export interface Database {
  "auth.user": AuthUser;
  "auth.session": AuthSession;
  "auth.account": AuthAccount;
  "auth.verification": AuthVerification;
  "asset.assets": AssetAssets;
  "financial.providers": FinancialProviders;
  "financial.connected_accounts": FinancialConnectedAccounts;
}
