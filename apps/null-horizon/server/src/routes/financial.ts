import { Hono } from "hono";
import { oauthService } from "../services/oauth.js";
import { repositories } from "../db/index.js";

type Variables = {
  user: { id: string; email: string; name: string } | null;
  session: any | null;
};

const financial = new Hono<{ Variables: Variables }>();

// Middleware to ensure user is authenticated
financial.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  await next();
});

/**
 * GET /financial/providers
 * List available OAuth providers
 */
financial.get("/providers", async (c) => {
  try {
    const providers = oauthService.getAvailableProviders();
    return c.json({ providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return c.json({ error: "Failed to fetch providers" }, 500);
  }
});

/**
 * GET /financial/accounts
 * List user's connected financial accounts
 */
financial.get("/accounts", async (c) => {
  try {
    const user = c.get("user")!;
    const accounts = await repositories.financialConnectedAccounts.findByUserIdWithProvider(user.id);

    // Format response to hide sensitive data
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      provider: {
        name: account.provider_name,
        displayName: account.provider_display_name
      },
      accountName: account.account_name,
      accountType: account.account_type,
      externalAccountId: account.external_account_id,
      syncStatus: account.sync_status,
      lastSyncAt: account.last_sync_at,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      // Never expose encrypted tokens in API responses
    }));

    return c.json({ accounts: formattedAccounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return c.json({ error: "Failed to fetch accounts" }, 500);
  }
});

/**
 * POST /financial/connect/:provider
 * Initiate OAuth connection flow
 */
financial.post("/connect/:provider", async (c) => {
  try {
    const user = c.get("user")!;
    const providerName = c.req.param("provider");

    // Validate provider exists
    const provider = oauthService.getProvider(providerName);
    if (!provider) {
      return c.json({ error: "Provider not supported" }, 400);
    }

    // Generate OAuth URL
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:3001'}/api/financial/callback/${providerName}`;

    const authResult = await oauthService.generateAuthUrl(user.id, providerName, redirectUri);
    if (!authResult) {
      return c.json({ error: "Failed to generate authorization URL" }, 500);
    }

    return c.json({
      authUrl: authResult.url,
      state: authResult.state,
      provider: {
        name: provider.name,
        displayName: provider.displayName
      }
    });
  } catch (error) {
    console.error("Error initiating OAuth:", error);
    return c.json({
      error: error instanceof Error ? error.message : "Failed to initiate connection"
    }, 500);
  }
});

/**
 * GET /financial/callback/:provider
 * Handle OAuth callback
 */
financial.get("/callback/:provider", async (c) => {
  try {
    const providerName = c.req.param("provider");
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    // Handle OAuth error responses
    if (error) {
      console.error(`OAuth error from ${providerName}:`, error, errorDescription);
      const errorMessage = errorDescription || error;

      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return c.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent(errorMessage)}`);
    }

    if (!code || !state) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return c.redirect(`${frontendUrl}/dashboard/accounts?error=Missing+authorization+code+or+state`);
    }

    // Handle the callback
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:3001'}/api/financial/callback/${providerName}`;
    const result = await oauthService.handleCallback(code, state, redirectUri);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (result.success) {
      return c.redirect(`${frontendUrl}/dashboard/accounts?success=true&accountId=${result.accountId}`);
    } else {
      return c.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent(result.error || 'Connection failed')}`);
    }
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return c.redirect(`${frontendUrl}/dashboard/accounts?error=Connection+failed`);
  }
});

/**
 * DELETE /financial/accounts/:id
 * Disconnect a financial account
 */
financial.delete("/accounts/:id", async (c) => {
  try {
    const user = c.get("user")!;
    const accountId = c.req.param("id");

    const success = await oauthService.revokeAccess(accountId, user.id);

    if (success) {
      return c.json({ success: true, message: "Account disconnected successfully" });
    } else {
      return c.json({ error: "Failed to disconnect account" }, 500);
    }
  } catch (error) {
    console.error("Error disconnecting account:", error);
    return c.json({ error: "Failed to disconnect account" }, 500);
  }
});

/**
 * POST /financial/accounts/:id/refresh
 * Manually refresh account tokens
 */
financial.post("/accounts/:id/refresh", async (c) => {
  try {
    const user = c.get("user")!;
    const accountId = c.req.param("id");

    const success = await oauthService.refreshToken(accountId, user.id);

    if (success) {
      return c.json({ success: true, message: "Tokens refreshed successfully" });
    } else {
      return c.json({ error: "Failed to refresh tokens" }, 500);
    }
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return c.json({ error: "Failed to refresh tokens" }, 500);
  }
});

/**
 * POST /financial/accounts/:id/sync
 * Trigger manual sync for an account
 */
financial.post("/accounts/:id/sync", async (c) => {
  try {
    const user = c.get("user")!;
    const accountId = c.req.param("id");

    // Update sync status to 'syncing'
    await repositories.financialConnectedAccounts.updateSyncStatus(accountId, 'syncing');

    // TODO: Implement actual data sync logic here
    // For now, just mark as successful
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    await repositories.financialConnectedAccounts.updateSyncStatus(accountId, 'success');

    return c.json({ success: true, message: "Sync initiated successfully" });
  } catch (error) {
    console.error("Error syncing account:", error);
    await repositories.financialConnectedAccounts.updateSyncStatus(
      c.req.param("id"),
      'error',
      error instanceof Error ? error.message : 'Sync failed'
    );
    return c.json({ error: "Failed to sync account" }, 500);
  }
});

/**
 * GET /financial/accounts/:id
 * Get detailed information about a connected account
 */
financial.get("/accounts/:id", async (c) => {
  try {
    const user = c.get("user")!;
    const accountId = c.req.param("id");

    const account = await repositories.financialConnectedAccounts.findByIdAndUserId(accountId, user.id);

    if (!account) {
      return c.json({ error: "Account not found" }, 404);
    }

    // Get provider information
    const provider = await repositories.financialProviders.findById(account.provider_id);

    const formattedAccount = {
      id: account.id,
      provider: provider ? {
        name: provider.name,
        displayName: provider.display_name
      } : null,
      accountName: account.account_name,
      accountType: account.account_type,
      externalAccountId: account.external_account_id,
      syncStatus: account.sync_status,
      syncError: account.sync_error,
      lastSyncAt: account.last_sync_at,
      tokenExpiresAt: account.token_expires_at,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      // Never expose encrypted tokens
    };

    return c.json({ account: formattedAccount });
  } catch (error) {
    console.error("Error fetching account:", error);
    return c.json({ error: "Failed to fetch account" }, 500);
  }
});

/**
 * PATCH /financial/accounts/:id
 * Update account settings (name, etc.)
 */
financial.patch("/accounts/:id", async (c) => {
  try {
    const user = c.get("user")!;
    const accountId = c.req.param("id");
    const body = await c.req.json();

    // Only allow updating certain fields
    const allowedFields = ['accountName'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }

    const updatedAccount = await repositories.financialConnectedAccounts.updateByIdAndUserId(
      accountId,
      user.id,
      updateData
    );

    if (!updatedAccount) {
      return c.json({ error: "Account not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Account updated successfully",
      account: {
        id: updatedAccount.id,
        accountName: updatedAccount.account_name,
        updatedAt: updatedAccount.updated_at
      }
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return c.json({ error: "Failed to update account" }, 500);
  }
});

export { financial };
