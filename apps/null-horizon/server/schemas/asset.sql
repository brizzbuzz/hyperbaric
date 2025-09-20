CREATE SCHEMA IF NOT EXISTS asset;

CREATE TABLE asset.assets (
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  symbol VARCHAR(20) NOT NULL UNIQUE,
  -- e.g., 'BTC', 'ETH', 'ADA'
  name VARCHAR(255) NOT NULL,
  -- e.g., 'Bitcoin', 'Ethereum', 'Cardano'
  decimals INTEGER NOT NULL DEFAULT 8,
  -- precision for the asset
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE INDEX idx_assets_symbol ON asset.assets(symbol);
CREATE
OR REPLACE FUNCTION asset.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_assets_updated_at BEFORE
UPDATE
  ON asset.assets FOR EACH ROW EXECUTE FUNCTION asset.update_updated_at_column();
