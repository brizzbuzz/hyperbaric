import crypto from "node:crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For GCM, this is always 16 bytes
const TAG_LENGTH = 16; // GCM authentication tag length
const KEY_LENGTH = 32; // 256 bits

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export class TokenEncryption {
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error("ENCRYPTION_KEY environment variable is required");
    }

    // Ensure key is exactly 32 bytes for AES-256
    if (key.length !== 64) {
      // 32 bytes = 64 hex characters
      throw new Error(
        "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)",
      );
    }

    return Buffer.from(key, "hex");
  }

  /**
   * Encrypt sensitive text data using AES-256-GCM
   */
  static encrypt(plaintext: string): EncryptedData {
    if (!plaintext) {
      throw new Error("Cannot encrypt empty or null data");
    }

    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from("oauth-token", "utf8")); // Additional authenticated data

      let encrypted = cipher.update(plaintext, "utf8", "hex");
      encrypted += cipher.final("hex");

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Decrypt encrypted data back to plaintext
   */
  static decrypt(encryptedData: EncryptedData): string {
    if (
      !encryptedData?.encrypted ||
      !encryptedData?.iv ||
      !encryptedData?.tag
    ) {
      throw new Error("Invalid encrypted data structure");
    }

    try {
      const key = this.getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, "hex");
      const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv);

      decipher.setAAD(Buffer.from("oauth-token", "utf8")); // Same AAD used in encryption
      decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

      let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "Invalid encrypted data"}`,
      );
    }
  }

  /**
   * Encrypt OAuth tokens for database storage
   */
  static encryptTokens(
    accessToken: string,
    refreshToken?: string,
  ): {
    encryptedAccessToken: string;
    encryptedRefreshToken: string | null;
  } {
    const encryptedAccessToken = JSON.stringify(this.encrypt(accessToken));
    const encryptedRefreshToken = refreshToken
      ? JSON.stringify(this.encrypt(refreshToken))
      : null;

    return {
      encryptedAccessToken,
      encryptedRefreshToken,
    };
  }

  /**
   * Decrypt OAuth tokens from database storage
   */
  static decryptTokens(
    encryptedAccessToken: string,
    encryptedRefreshToken?: string | null,
  ): {
    accessToken: string;
    refreshToken: string | null;
  } {
    try {
      const accessTokenData: EncryptedData = JSON.parse(encryptedAccessToken);
      const accessToken = this.decrypt(accessTokenData);

      let refreshToken: string | null = null;
      if (encryptedRefreshToken) {
        const refreshTokenData: EncryptedData = JSON.parse(
          encryptedRefreshToken,
        );
        refreshToken = this.decrypt(refreshTokenData);
      }

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(
        `Token decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate a secure encryption key for development/setup
   * This should only be used during initial setup
   */
  static generateEncryptionKey(): string {
    const key = crypto.randomBytes(KEY_LENGTH);
    return key.toString("hex");
  }

  /**
   * Validate that the encryption system is properly configured
   */
  static validateConfiguration(): { isValid: boolean; error?: string } {
    try {
      // Test encryption/decryption cycle
      const testData = "test-oauth-token-123";
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);

      if (decrypted !== testData) {
        return { isValid: false, error: "Encryption round-trip failed" };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }
}

// Type guards for encrypted data
export function isEncryptedData(data: any): data is EncryptedData {
  return (
    data &&
    typeof data.encrypted === "string" &&
    typeof data.iv === "string" &&
    typeof data.tag === "string"
  );
}

// Helper for secure token handling
export class SecureTokenHandler {
  /**
   * Safely handle token operations with automatic cleanup
   */
  static async withTokens<T>(
    encryptedAccessToken: string,
    encryptedRefreshToken: string | null,
    operation: (accessToken: string, refreshToken: string | null) => Promise<T>,
  ): Promise<T> {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    try {
      const tokens = TokenEncryption.decryptTokens(
        encryptedAccessToken,
        encryptedRefreshToken,
      );
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;

      return await operation(accessToken, refreshToken);
    } finally {
      // Securely clear sensitive data from memory
      if (accessToken) {
        // Overwrite the string in memory (best effort)
        (accessToken as any) = null;
      }
      if (refreshToken) {
        (refreshToken as any) = null;
      }
    }
  }
}
