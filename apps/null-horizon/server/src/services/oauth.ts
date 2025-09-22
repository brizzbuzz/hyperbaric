import crypto from "node:crypto";
import { repositories } from "../db/index.js";
import { TokenEncryption } from "../lib/encryption.js";

export interface OAuthProvider {
  name: string;
  displayName: string;
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  apiBaseUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

export interface OAuthState {
  userId: string;
  providerId: string;
  state: string;
  codeVerifier?: string; // For PKCE
  redirectUri: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

export interface AccountInfo {
  id: string;
  name: string;
  type?: string;
  // Provider-specific data will vary
  [key: string]: any;
}

export class FinancialOAuthService {
  private providers: Map<string, OAuthProvider> = new Map();
  private pendingStates: Map<string, OAuthState> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Coinbase OAuth configuration
    if (process.env.COINBASE_CLIENT_ID && process.env.COINBASE_CLIENT_SECRET) {
      this.providers.set("coinbase", {
        name: "coinbase",
        displayName: "Coinbase",
        authorizationUrl: "https://www.coinbase.com/oauth/authorize",
        tokenUrl: "https://api.coinbase.com/oauth/token",
        revokeUrl: "https://api.coinbase.com/oauth/revoke",
        apiBaseUrl: "https://api.coinbase.com/v2",
        scopes: ["wallet:user:read", "wallet:accounts:read", "wallet:transactions:read"],
        clientId: process.env.COINBASE_CLIENT_ID,
        clientSecret: process.env.COINBASE_CLIENT_SECRET,
      });
    }

    // Schwab OAuth configuration
    if (process.env.SCHWAB_CLIENT_ID && process.env.SCHWAB_CLIENT_SECRET) {
      this.providers.set("schwab", {
        name: "schwab",
        displayName: "Charles Schwab",
        authorizationUrl: "https://api.schwabapi.com/oauth/authorize",
        tokenUrl: "https://api.schwabapi.com/oauth/token",
        revokeUrl: "https://api.schwabapi.com/oauth/revoke",
        apiBaseUrl: "https://api.schwabapi.com/trader/v1",
        scopes: ["AccountsAndTrading"],
        clientId: process.env.SCHWAB_CLIENT_ID,
        clientSecret: process.env.SCHWAB_CLIENT_SECRET,
      });
    }
  }

  /**
   * Get available OAuth providers
   */
  getAvailableProviders(): OAuthProvider[] {
    return Array.from(this.providers.values()).map(provider => ({
      ...provider,
      clientSecret: "[REDACTED]" // Don't expose secrets
    }));
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): OAuthProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate OAuth authorization URL
   */
  async generateAuthUrl(
    userId: string,
    providerName: string,
    redirectUri: string
  ): Promise<{ url: string; state: string } | null> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found or not configured`);
    }

    // Get provider record from database
    const dbProvider = await repositories.financialProviders.findByName(providerName);
    if (!dbProvider) {
      throw new Error(`Provider ${providerName} not found in database`);
    }

    const state = crypto.randomBytes(32).toString('hex');
    const { codeVerifier, codeChallenge } = this.generatePKCE();

    // Store OAuth state temporarily (in production, use Redis or database)
    const oauthState: OAuthState = {
      userId,
      providerId: dbProvider.id,
      state,
      codeVerifier,
      redirectUri,
    };

    this.pendingStates.set(state, oauthState);

    // Clean up expired states (expire after 10 minutes)
    setTimeout(() => {
      this.pendingStates.delete(state);
    }, 10 * 60 * 1000);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: redirectUri,
      scope: provider.scopes.join(' '),
      state,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${provider.authorizationUrl}?${params.toString()}`;

    return { url: authUrl, state };
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(
    code: string,
    state: string,
    receivedRedirectUri: string
  ): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      // Validate state
      const oauthState = this.pendingStates.get(state);
      if (!oauthState) {
        return { success: false, error: 'Invalid or expired state parameter' };
      }

      // Remove used state
      this.pendingStates.delete(state);

      // Validate redirect URI matches
      if (oauthState.redirectUri !== receivedRedirectUri) {
        return { success: false, error: 'Redirect URI mismatch' };
      }

      // Get provider info
      const dbProvider = await repositories.financialProviders.findById(oauthState.providerId);
      if (!dbProvider) {
        return { success: false, error: 'Provider not found' };
      }

      const provider = this.providers.get(dbProvider.name);
      if (!provider) {
        return { success: false, error: 'Provider configuration not found' };
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(
        provider,
        code,
        oauthState.redirectUri,
        oauthState.codeVerifier!
      );

      // Get account information from provider
      const accountInfo = await this.getAccountInfo(provider, tokenResponse.access_token);

      // Calculate token expiration
      const tokenExpiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined;

      // Store connected account
      const connectedAccount = await repositories.financialConnectedAccounts.create({
        userId: oauthState.userId,
        providerId: oauthState.providerId,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiresAt,
        externalAccountId: accountInfo.id,
        accountName: accountInfo.name,
        accountType: accountInfo.type,
      });

      return { success: true, accountId: connectedAccount.id };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(
    provider: OAuthProvider,
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    return await response.json() as TokenResponse;
  }

  /**
   * Get account information from provider API
   */
  private async getAccountInfo(provider: OAuthProvider, accessToken: string): Promise<AccountInfo> {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    };

    if (provider.name === 'coinbase') {
      return this.getCoinbaseAccountInfo(provider, headers);
    } else if (provider.name === 'schwab') {
      return this.getSchwabAccountInfo(provider, headers);
    }

    throw new Error(`Account info not implemented for provider: ${provider.name}`);
  }

  /**
   * Get Coinbase account information
   */
  private async getCoinbaseAccountInfo(
    provider: OAuthProvider,
    headers: Record<string, string>
  ): Promise<AccountInfo> {
    const response = await fetch(`${provider.apiBaseUrl}/user`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get Coinbase user info: ${response.status}`);
    }

    const data = await response.json();
    const user = data.data;

    return {
      id: user.id,
      name: user.name || user.username || 'Coinbase Account',
      type: 'crypto',
      email: user.email,
      country: user.country?.name,
    };
  }

  /**
   * Get Schwab account information
   */
  private async getSchwabAccountInfo(
    provider: OAuthProvider,
    headers: Record<string, string>
  ): Promise<AccountInfo> {
    const response = await fetch(`${provider.apiBaseUrl}/accounts`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get Schwab account info: ${response.status}`);
    }

    const data = await response.json();

    // Schwab returns array of accounts, use first one for now
    const account = data[0] || {};

    return {
      id: account.accountNumber || account.hashValue,
      name: `Schwab ${account.type || 'Account'}`,
      type: account.type?.toLowerCase() || 'investment',
      accountNumber: account.accountNumber,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(accountId: string, userId: string): Promise<boolean> {
    try {
      const account = await repositories.financialConnectedAccounts.getAccountWithTokens(accountId, userId);
      if (!account || !account.refreshToken) {
        return false;
      }

      const dbProvider = await repositories.financialProviders.findById(account.provider_id);
      if (!dbProvider) {
        return false;
      }

      const provider = this.providers.get(dbProvider.name);
      if (!provider) {
        return false;
      }

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        refresh_token: account.refreshToken,
      });

      const response = await fetch(provider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        await repositories.financialConnectedAccounts.updateSyncStatus(accountId, 'error', 'Token refresh failed');
        return false;
      }

      const tokenResponse = await response.json() as TokenResponse;

      const tokenExpiresAt = tokenResponse.expires_in
        ? new Date(Date.now() + tokenResponse.expires_in * 1000)
        : undefined;

      await repositories.financialConnectedAccounts.update(accountId, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || account.refreshToken,
        tokenExpiresAt,
      });

      await repositories.financialConnectedAccounts.updateSyncStatus(accountId, 'success');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await repositories.financialConnectedAccounts.updateSyncStatus(
        accountId,
        'error',
        error instanceof Error ? error.message : 'Token refresh failed'
      );
      return false;
    }
  }

  /**
   * Revoke access token and disconnect account
   */
  async revokeAccess(accountId: string, userId: string): Promise<boolean> {
    try {
      const account = await repositories.financialConnectedAccounts.getAccountWithTokens(accountId, userId);
      if (!account) {
        return false;
      }

      const dbProvider = await repositories.financialProviders.findById(account.provider_id);
      if (!dbProvider) {
        return false;
      }

      const provider = this.providers.get(dbProvider.name);
      if (!provider?.revokeUrl) {
        // If no revoke URL, just deactivate the account
        await repositories.financialConnectedAccounts.deactivateByIdAndUserId(accountId, userId);
        return true;
      }

      // Revoke token with provider
      const params = new URLSearchParams({
        token: account.accessToken,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
      });

      const response = await fetch(provider.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      // Deactivate account regardless of revoke response
      // (provider might already have revoked/expired the token)
      await repositories.financialConnectedAccounts.deactivateByIdAndUserId(accountId, userId);

      return true;
    } catch (error) {
      console.error('Token revoke error:', error);
      // Still deactivate the account even if revoke fails
      await repositories.financialConnectedAccounts.deactivateByIdAndUserId(accountId, userId);
      return false;
    }
  }

  /**
   * Check and refresh tokens that are about to expire
   */
  async refreshExpiringTokens(): Promise<void> {
    try {
      const expiringAccounts = await repositories.financialConnectedAccounts.findAccountsNeedingRefresh();

      const refreshPromises = expiringAccounts.map(account =>
        this.refreshToken(account.id, account.user_id)
      );

      await Promise.allSettled(refreshPromises);
    } catch (error) {
      console.error('Bulk token refresh error:', error);
    }
  }
}

// Singleton instance
export const oauthService = new FinancialOAuthService();
