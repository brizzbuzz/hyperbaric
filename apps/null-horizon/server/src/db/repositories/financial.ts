import type { Kysely } from "kysely";
import type { Database, FinancialProviders, FinancialConnectedAccounts } from "../types.js";
import { TokenEncryption } from "../../lib/encryption.js";

export interface CreateConnectedAccountData {
  userId: string;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  externalAccountId: string;
  accountName?: string;
  accountType?: string;
}

export interface UpdateConnectedAccountData {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  accountName?: string;
  accountType?: string;
  isActive?: boolean;
  lastSyncAt?: Date;
  syncStatus?: string;
  syncError?: string;
}

export interface ConnectedAccountWithTokens extends Omit<FinancialConnectedAccounts, 'encrypted_access_token' | 'encrypted_refresh_token'> {
  accessToken: string;
  refreshToken: string | null;
}

export class FinancialProviderRepository {
  constructor(private db: Kysely<Database>) {}

  async findAll(): Promise<FinancialProviders[]> {
    return this.db
      .selectFrom("financial.providers")
      .selectAll()
      .where("is_active", "=", true)
      .orderBy("display_name")
      .execute();
  }

  async findById(id: string): Promise<FinancialProviders | undefined> {
    return this.db
      .selectFrom("financial.providers")
      .selectAll()
      .where("id", "=", id)
      .where("is_active", "=", true)
      .executeTakeFirst();
  }

  async findByName(name: string): Promise<FinancialProviders | undefined> {
    return this.db
      .selectFrom("financial.providers")
      .selectAll()
      .where("name", "=", name)
      .where("is_active", "=", true)
      .executeTakeFirst();
  }

  async create(data: Omit<FinancialProviders, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<FinancialProviders> {
    return this.db
      .insertInto("financial.providers")
      .values({
        ...data,
        is_active: true
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: Partial<Pick<FinancialProviders, 'display_name' | 'oauth_config' | 'is_active'>>): Promise<FinancialProviders | undefined> {
    return this.db
      .updateTable("financial.providers")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable("financial.providers")
      .set({ is_active: false })
      .where("id", "=", id)
      .execute();

    return result.length > 0 && Number(result[0].numUpdatedRows) > 0;
  }
}

export class FinancialConnectedAccountRepository {
  constructor(private db: Kysely<Database>) {}

  async findByUserId(userId: string): Promise<FinancialConnectedAccounts[]> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("user_id", "=", userId)
      .where("is_active", "=", true)
      .orderBy("created_at", "desc")
      .execute();
  }

  async findByUserIdWithProvider(userId: string): Promise<Array<FinancialConnectedAccounts & { provider: FinancialProviders }>> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .innerJoin("financial.providers", "financial.connected_accounts.provider_id", "financial.providers.id")
      .select([
        "financial.connected_accounts.id",
        "financial.connected_accounts.user_id",
        "financial.connected_accounts.provider_id",
        "financial.connected_accounts.encrypted_access_token",
        "financial.connected_accounts.encrypted_refresh_token",
        "financial.connected_accounts.token_expires_at",
        "financial.connected_accounts.refresh_token_expires_at",
        "financial.connected_accounts.external_account_id",
        "financial.connected_accounts.account_name",
        "financial.connected_accounts.account_type",
        "financial.connected_accounts.is_active",
        "financial.connected_accounts.last_sync_at",
        "financial.connected_accounts.sync_status",
        "financial.connected_accounts.sync_error",
        "financial.connected_accounts.created_at",
        "financial.connected_accounts.updated_at",
        "financial.providers.name as provider_name",
        "financial.providers.display_name as provider_display_name",
        "financial.providers.oauth_config as provider_oauth_config"
      ])
      .where("financial.connected_accounts.user_id", "=", userId)
      .where("financial.connected_accounts.is_active", "=", true)
      .where("financial.providers.is_active", "=", true)
      .orderBy("financial.connected_accounts.created_at", "desc")
      .execute() as any; // Type assertion needed due to join complexity
  }

  async findById(id: string): Promise<FinancialConnectedAccounts | undefined> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByIdAndUserId(id: string, userId: string): Promise<FinancialConnectedAccounts | undefined> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .executeTakeFirst();
  }

  async findByExternalId(providerId: string, externalAccountId: string): Promise<FinancialConnectedAccounts | undefined> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("provider_id", "=", providerId)
      .where("external_account_id", "=", externalAccountId)
      .executeTakeFirst();
  }

  async create(data: CreateConnectedAccountData): Promise<FinancialConnectedAccounts> {
    // Encrypt tokens before storing
    const { encryptedAccessToken, encryptedRefreshToken } = TokenEncryption.encryptTokens(
      data.accessToken,
      data.refreshToken
    );

    return this.db
      .insertInto("financial.connected_accounts")
      .values({
        user_id: data.userId,
        provider_id: data.providerId,
        encrypted_access_token: encryptedAccessToken,
        encrypted_refresh_token: encryptedRefreshToken,
        token_expires_at: data.tokenExpiresAt,
        refresh_token_expires_at: data.refreshTokenExpiresAt,
        external_account_id: data.externalAccountId,
        account_name: data.accountName,
        account_type: data.accountType,
        is_active: true,
        sync_status: 'pending'
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: UpdateConnectedAccountData): Promise<FinancialConnectedAccounts | undefined> {
    const updateData: any = { ...data };

    // Handle token encryption if tokens are being updated
    if (data.accessToken) {
      const { encryptedAccessToken, encryptedRefreshToken } = TokenEncryption.encryptTokens(
        data.accessToken,
        data.refreshToken
      );
      updateData.encrypted_access_token = encryptedAccessToken;
      updateData.encrypted_refresh_token = encryptedRefreshToken;
      delete updateData.accessToken;
      delete updateData.refreshToken;
    }

    return this.db
      .updateTable("financial.connected_accounts")
      .set(updateData)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateByIdAndUserId(id: string, userId: string, data: UpdateConnectedAccountData): Promise<FinancialConnectedAccounts | undefined> {
    const updateData: any = { ...data };

    // Handle token encryption if tokens are being updated
    if (data.accessToken) {
      const { encryptedAccessToken, encryptedRefreshToken } = TokenEncryption.encryptTokens(
        data.accessToken,
        data.refreshToken
      );
      updateData.encrypted_access_token = encryptedAccessToken;
      updateData.encrypted_refresh_token = encryptedRefreshToken;
      delete updateData.accessToken;
      delete updateData.refreshToken;
    }

    return this.db
      .updateTable("financial.connected_accounts")
      .set(updateData)
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst();
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable("financial.connected_accounts")
      .set({
        is_active: false,
        sync_status: 'disconnected'
      })
      .where("id", "=", id)
      .execute();

    return result.length > 0 && Number(result[0].numUpdatedRows) > 0;
  }

  async deactivateByIdAndUserId(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .updateTable("financial.connected_accounts")
      .set({
        is_active: false,
        sync_status: 'disconnected'
      })
      .where("id", "=", id)
      .where("user_id", "=", userId)
      .execute();

    return result.length > 0 && Number(result[0].numUpdatedRows) > 0;
  }

  /**
   * Get account with decrypted tokens for API operations
   * Use with caution and ensure proper cleanup
   */
  async getAccountWithTokens(id: string, userId: string): Promise<ConnectedAccountWithTokens | undefined> {
    const account = await this.findByIdAndUserId(id, userId);
    if (!account) {
      return undefined;
    }

    try {
      const { accessToken, refreshToken } = TokenEncryption.decryptTokens(
        account.encrypted_access_token,
        account.encrypted_refresh_token
      );

      return {
        ...account,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw new Error(`Failed to decrypt tokens for account ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update sync status and metadata
   */
  async updateSyncStatus(id: string, status: string, error?: string): Promise<void> {
    await this.db
      .updateTable("financial.connected_accounts")
      .set({
        sync_status: status,
        sync_error: error || null,
        last_sync_at: new Date()
      })
      .where("id", "=", id)
      .execute();
  }

  /**
   * Find accounts that need token refresh
   */
  async findAccountsNeedingRefresh(): Promise<FinancialConnectedAccounts[]> {
    const now = new Date();
    const bufferMinutes = 10; // Refresh tokens 10 minutes before expiry
    const refreshTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);

    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("is_active", "=", true)
      .where("token_expires_at", "<", refreshTime)
      .where("encrypted_refresh_token", "is not", null)
      .where("sync_status", "!=", "error")
      .execute();
  }

  /**
   * Find accounts by sync status
   */
  async findAccountsByStatus(status: string): Promise<FinancialConnectedAccounts[]> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .selectAll()
      .where("sync_status", "=", status)
      .where("is_active", "=", true)
      .execute();
  }

  /**
   * Get account count by provider for a user
   */
  async getAccountCountByProvider(userId: string): Promise<Array<{ provider_name: string; count: number }>> {
    return this.db
      .selectFrom("financial.connected_accounts")
      .innerJoin("financial.providers", "financial.connected_accounts.provider_id", "financial.providers.id")
      .select([
        "financial.providers.name as provider_name",
        this.db.fn.count("financial.connected_accounts.id").as("count")
      ])
      .where("financial.connected_accounts.user_id", "=", userId)
      .where("financial.connected_accounts.is_active", "=", true)
      .groupBy("financial.providers.name")
      .execute() as any;
  }
}
