import type { Kysely } from "kysely";
import type { Database } from "../types.js";
import {
  UserRepository,
  SessionRepository,
  AccountRepository,
  VerificationRepository,
} from "./auth.js";
import { FeedRepository, ArticleRepository } from "./content.js";
import {
  ArticleSummaryRepository,
  ArticleClassificationRepository,
  RecommendationRepository,
} from "./ai.js";
import {
  FeedSubscriptionRepository,
  ReadingHistoryRepository,
  BookmarkRepository,
  UserPreferenceRepository,
} from "./user.js";
import {
  FeedJobRepository,
  AIJobRepository,
  SystemSettingsRepository,
  SystemMetricsRepository,
} from "./system.js";

export class RepositoryFactory {
  private db: Kysely<Database>;
  private _userRepository?: UserRepository;
  private _sessionRepository?: SessionRepository;
  private _accountRepository?: AccountRepository;
  private _verificationRepository?: VerificationRepository;
  private _feedRepository?: FeedRepository;
  private _articleRepository?: ArticleRepository;
  private _articleSummaryRepository?: ArticleSummaryRepository;
  private _articleClassificationRepository?: ArticleClassificationRepository;
  private _recommendationRepository?: RecommendationRepository;
  private _feedSubscriptionRepository?: FeedSubscriptionRepository;
  private _readingHistoryRepository?: ReadingHistoryRepository;
  private _bookmarkRepository?: BookmarkRepository;
  private _userPreferenceRepository?: UserPreferenceRepository;
  private _feedJobRepository?: FeedJobRepository;
  private _aiJobRepository?: AIJobRepository;
  private _systemSettingsRepository?: SystemSettingsRepository;
  private _systemMetricsRepository?: SystemMetricsRepository;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  // Auth repositories
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

  // Content repositories
  get feeds(): FeedRepository {
    if (!this._feedRepository) {
      this._feedRepository = new FeedRepository(this.db);
    }
    return this._feedRepository;
  }

  get articles(): ArticleRepository {
    if (!this._articleRepository) {
      this._articleRepository = new ArticleRepository(this.db);
    }
    return this._articleRepository;
  }

  // AI repositories
  get articleSummaries(): ArticleSummaryRepository {
    if (!this._articleSummaryRepository) {
      this._articleSummaryRepository = new ArticleSummaryRepository(this.db);
    }
    return this._articleSummaryRepository;
  }

  get articleClassifications(): ArticleClassificationRepository {
    if (!this._articleClassificationRepository) {
      this._articleClassificationRepository = new ArticleClassificationRepository(this.db);
    }
    return this._articleClassificationRepository;
  }

  get recommendations(): RecommendationRepository {
    if (!this._recommendationRepository) {
      this._recommendationRepository = new RecommendationRepository(this.db);
    }
    return this._recommendationRepository;
  }

  // User repositories
  get feedSubscriptions(): FeedSubscriptionRepository {
    if (!this._feedSubscriptionRepository) {
      this._feedSubscriptionRepository = new FeedSubscriptionRepository(this.db);
    }
    return this._feedSubscriptionRepository;
  }

  get readingHistory(): ReadingHistoryRepository {
    if (!this._readingHistoryRepository) {
      this._readingHistoryRepository = new ReadingHistoryRepository(this.db);
    }
    return this._readingHistoryRepository;
  }

  get bookmarks(): BookmarkRepository {
    if (!this._bookmarkRepository) {
      this._bookmarkRepository = new BookmarkRepository(this.db);
    }
    return this._bookmarkRepository;
  }

  get userPreferences(): UserPreferenceRepository {
    if (!this._userPreferenceRepository) {
      this._userPreferenceRepository = new UserPreferenceRepository(this.db);
    }
    return this._userPreferenceRepository;
  }

  // System repositories
  get feedJobs(): FeedJobRepository {
    if (!this._feedJobRepository) {
      this._feedJobRepository = new FeedJobRepository(this.db);
    }
    return this._feedJobRepository;
  }

  get aiJobs(): AIJobRepository {
    if (!this._aiJobRepository) {
      this._aiJobRepository = new AIJobRepository(this.db);
    }
    return this._aiJobRepository;
  }

  get systemSettings(): SystemSettingsRepository {
    if (!this._systemSettingsRepository) {
      this._systemSettingsRepository = new SystemSettingsRepository(this.db);
    }
    return this._systemSettingsRepository;
  }

  get systemMetrics(): SystemMetricsRepository {
    if (!this._systemMetricsRepository) {
      this._systemMetricsRepository = new SystemMetricsRepository(this.db);
    }
    return this._systemMetricsRepository;
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
export * from "./content.js";
export * from "./ai.js";
export * from "./user.js";
export * from "./system.js";
