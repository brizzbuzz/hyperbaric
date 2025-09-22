CREATE SCHEMA IF NOT EXISTS financial;

-- Financial institution providers
CREATE TABLE financial.providers (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'coinbase', 'schwab'
  display_name VARCHAR(100) NOT NULL, -- 'Coinbase', 'Charles Schwab'
  oauth_config JSONB NOT NULL, -- OAuth endpoints and config
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true
);

-- User's connected financial accounts
CREATE TABLE financial.connected_accounts (
  token_expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  account_name TEXT, -- User-friendly name
  encrypted_refresh_token TEXT,
  external_account_id TEXT NOT NULL, -- Account ID from provider
  account_type TEXT, -- 'checking', 'savings', 'investment', etc.
  encrypted_access_token TEXT NOT NULL,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'error'
  sync_error TEXT,
  user_id TEXT NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true,
  provider_id UUID NOT NULL REFERENCES financial.providers(id),

  UNIQUE(user_id, provider_id, external_account_id)
);

-- Indexes for better performance
CREATE INDEX idx_connected_accounts_user_id ON financial.connected_accounts(user_id);
CREATE INDEX idx_connected_accounts_provider_id ON financial.connected_accounts(provider_id);
CREATE INDEX idx_connected_accounts_external_id ON financial.connected_accounts(external_account_id);
CREATE INDEX idx_connected_accounts_sync_status ON financial.connected_accounts(sync_status);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION financial.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON financial.providers
    FOR EACH ROW EXECUTE FUNCTION financial.update_updated_at_column();

CREATE TRIGGER update_connected_accounts_updated_at
    BEFORE UPDATE ON financial.connected_accounts
    FOR EACH ROW EXECUTE FUNCTION financial.update_updated_at_column();

-- Insert default providers
INSERT INTO financial.providers (name, display_name, oauth_config) VALUES
('coinbase', 'Coinbase', '{
  "authorization_url": "https://www.coinbase.com/oauth/authorize",
  "token_url": "https://api.coinbase.com/oauth/token",
  "revoke_url": "https://api.coinbase.com/oauth/revoke",
  "api_base_url": "https://api.coinbase.com/v2",
  "scopes": ["wallet:user:read", "wallet:accounts:read", "wallet:transactions:read"]
}'),
('schwab', 'Charles Schwab', '{
  "authorization_url": "https://api.schwabapi.com/oauth/authorize",
  "token_url": "https://api.schwabapi.com/oauth/token",
  "revoke_url": "https://api.schwabapi.com/oauth/revoke",
  "api_base_url": "https://api.schwabapi.com/trader/v1",
  "scopes": ["AccountsAndTrading"]
}');
