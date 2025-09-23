import type { ColumnType } from "kysely";

// Utility types for timestamps
export type Generated<T> = ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

// Auth Schema Tables (copied from null-horizon)
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

// Content Schema Tables
export interface ContentFeeds {
  id: Generated<string>; // UUID as string
  url: string;
  title: string;
  description: string | null;
  website_url: string | null;
  language: string | null;
  category: string | null;
  image_url: string | null;
  last_fetched_at: Timestamp | null;
  fetch_status: 'active' | 'error' | 'paused';
  fetch_error: string | null;
  refresh_interval: number; // minutes
  is_active: boolean;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ContentArticles {
  id: Generated<string>; // UUID as string
  feed_id: string;
  external_id: string | null;
  title: string;
  content: string | null;
  summary: string | null;
  author: string | null;
  url: string | null;
  published_at: Timestamp | null;
  scraped_content: string | null;
  word_count: number | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

// AI Schema Tables
export interface AiArticleSummaries {
  id: Generated<string>; // UUID as string
  article_id: string;
  summary_type: 'brief' | 'detailed' | 'bullet_points';
  content: string;
  ai_provider: string;
  ai_model: string;
  generated_at: Generated<Timestamp>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface AiArticleClassifications {
  id: Generated<string>; // UUID as string
  article_id: string;
  classification_type: 'category' | 'tag' | 'sentiment' | 'topic';
  value: string;
  confidence_score: number | null; // decimal(4,3)
  ai_provider: string;
  ai_model: string;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface AiRecommendations {
  id: Generated<string>; // UUID as string
  user_id: string;
  article_id: string;
  recommendation_type: 'similar_content' | 'trending' | 'personalized';
  score: number | null; // decimal(5,4)
  reasoning: string | null;
  generated_at: Generated<Timestamp>;
  expires_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

// User Schema Tables
export interface UserFeedSubscriptions {
  id: Generated<string>; // UUID as string
  user_id: string;
  feed_id: string;
  is_active: boolean;
  notification_enabled: boolean;
  custom_name: string | null;
  subscribed_at: Generated<Timestamp>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface UserReadingHistory {
  id: Generated<string>; // UUID as string
  user_id: string;
  article_id: string;
  read_at: Generated<Timestamp>;
  read_duration: number | null; // seconds
  scroll_percentage: number | null; // decimal(5,2)
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface UserBookmarks {
  id: Generated<string>; // UUID as string
  user_id: string;
  article_id: string;
  custom_tags: string[] | null; // TEXT[]
  notes: string | null;
  bookmarked_at: Generated<Timestamp>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface UserPreferences {
  id: Generated<string>; // UUID as string
  user_id: string;
  preference_type: 'ai_summary' | 'content_filter' | 'notification' | 'display';
  key: string;
  value: Record<string, any>; // JSONB
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

// System Schema Tables
export interface SystemFeedJobs {
  id: Generated<string>; // UUID as string
  feed_id: string;
  job_type: 'fetch_feed' | 'process_articles' | 'generate_summaries';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: Timestamp | null;
  completed_at: Timestamp | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  priority: number; // 1 (highest) to 10 (lowest)
  metadata: Record<string, any> | null; // JSONB
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface SystemAiJobs {
  id: Generated<string>; // UUID as string
  article_id: string;
  job_type: 'summarize' | 'classify' | 'extract_entities' | 'generate_recommendations';
  status: 'pending' | 'running' | 'completed' | 'failed';
  ai_provider: string;
  ai_model: string;
  priority: number; // 1 (highest) to 10 (lowest)
  started_at: Timestamp | null;
  completed_at: Timestamp | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  input_data: Record<string, any> | null; // JSONB
  output_data: Record<string, any> | null; // JSONB
  cost_estimate: number | null; // decimal(10,4)
  actual_cost: number | null; // decimal(10,4)
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface SystemSettings {
  id: Generated<string>; // UUID as string
  key: string;
  value: Record<string, any>; // JSONB
  description: string | null;
  is_encrypted: boolean;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface SystemMetrics {
  id: Generated<string>; // UUID as string
  metric_name: string;
  metric_type: 'counter' | 'gauge' | 'histogram';
  value: number; // decimal
  tags: Record<string, any> | null; // JSONB
  recorded_at: Generated<Timestamp>;
  created_at: Generated<Timestamp>;
}

// Database Interface
export interface Database {
  "auth.user": AuthUser;
  "auth.session": AuthSession;
  "auth.account": AuthAccount;
  "auth.verification": AuthVerification;
  "content.feeds": ContentFeeds;
  "content.articles": ContentArticles;
  "ai.article_summaries": AiArticleSummaries;
  "ai.article_classifications": AiArticleClassifications;
  "ai.recommendations": AiRecommendations;
  "user.feed_subscriptions": UserFeedSubscriptions;
  "user.reading_history": UserReadingHistory;
  "user.bookmarks": UserBookmarks;
  "user.preferences": UserPreferences;
  "system.feed_jobs": SystemFeedJobs;
  "system.ai_jobs": SystemAiJobs;
  "system.settings": SystemSettings;
  "system.metrics": SystemMetrics;
}

// Export specific types for easier importing
export type {
  AuthUser,
  AuthSession,
  AuthAccount,
  AuthVerification,
  ContentFeeds,
  ContentArticles,
  AiArticleSummaries,
  AiArticleClassifications,
  AiRecommendations,
  UserFeedSubscriptions,
  UserReadingHistory,
  UserBookmarks,
  UserPreferences,
  SystemFeedJobs,
  SystemAiJobs,
  SystemSettings,
  SystemMetrics,
};
