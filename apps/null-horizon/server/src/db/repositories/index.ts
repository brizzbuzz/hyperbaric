import type { Kysely } from "kysely";
import type { Database } from "../types.js";
import {
  UserRepository,
  SessionRepository,
  AccountRepository,
  VerificationRepository,
} from "./auth.js";
import { AssetRepository } from "./asset.js";
import {
  FinancialProviderRepository,
  FinancialConnectedAccountRepository,
} from "./financial.js";

export class RepositoryFactory {
  private db: Kysely<Database>;
  private _userRepository?: UserRepository;
  private _sessionRepository?: SessionRepository;
  private _accountRepository?: AccountRepository;
  private _verificationRepository?: VerificationRepository;
  private _assetRepository?: AssetRepository;
  private _financialProviderRepository?: FinancialProviderRepository;
  private _financialConnectedAccountRepository?: FinancialConnectedAccountRepository;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  get users(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.db);
    }
    return this._userRepository;
  }

  get sessions(): SessionRepository {
    if (!this._sessionRepository) {
      this._sessionRepository = new SessionRepository(this.db);
    }
    return this._sessionRepository;
  }

  get accounts(): AccountRepository {
    if (!this._accountRepository) {
      this._accountRepository = new AccountRepository(this.db);
    }
    return this._accountRepository;
  }

  get verifications(): VerificationRepository {
    if (!this._verificationRepository) {
      this._verificationRepository = new VerificationRepository(this.db);
    }
    return this._verificationRepository;
  }

  get assets(): AssetRepository {
    if (!this._assetRepository) {
      this._assetRepository = new AssetRepository(this.db);
    }
    return this._assetRepository;
  }

  get financialProviders(): FinancialProviderRepository {
    if (!this._financialProviderRepository) {
      this._financialProviderRepository = new FinancialProviderRepository(
        this.db,
      );
    }
    return this._financialProviderRepository;
  }

  get financialConnectedAccounts(): FinancialConnectedAccountRepository {
    if (!this._financialConnectedAccountRepository) {
      this._financialConnectedAccountRepository =
        new FinancialConnectedAccountRepository(this.db);
    }
    return this._financialConnectedAccountRepository;
  }
}

// Singleton instance
let repositoryFactory: RepositoryFactory | null = null;

export function createRepositoryFactory(
  db: Kysely<Database>,
): RepositoryFactory {
  if (!repositoryFactory) {
    repositoryFactory = new RepositoryFactory(db);
  }
  return repositoryFactory;
}

export function getRepositories(): RepositoryFactory {
  if (!repositoryFactory) {
    throw new Error(
      "Repository factory not initialized. Call createRepositoryFactory first.",
    );
  }
  return repositoryFactory;
}

// Re-export types and repositories
export * from "./auth.js";
export * from "./asset.js";
export * from "./financial.js";
