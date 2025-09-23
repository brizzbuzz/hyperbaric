import type { Kysely } from "kysely";
import type {
  Database,
  UserFeedSubscriptions,
  UserReadingHistory,
  UserBookmarks,
  UserPreferences,
} from "../types.js";

export class FeedSubscriptionRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<UserFeedSubscriptions, "id" | "created_at" | "updated_at" | "subscribed_at">) {
    return await this.db
      .insertInto("user.feed_subscriptions")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("user.feed_subscriptions")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string, isActive?: boolean) {
    let query = this.db
      .selectFrom("user.feed_subscriptions")
      .innerJoin("content.feeds", "content.feeds.id", "user.feed_subscriptions.feed_id")
      .select([
        "user.feed_subscriptions.id",
        "user.feed_subscriptions.user_id",
        "user.feed_subscriptions.feed_id",
        "user.feed_subscriptions.is_active",
        "user.feed_subscriptions.notification_enabled",
        "user.feed_subscriptions.custom_name",
        "user.feed_subscriptions.subscribed_at",
        "user.feed_subscriptions.created_at",
        "user.feed_subscriptions.updated_at",
        "content.feeds.title as feed_title",
        "content.feeds.url as feed_url",
        "content.feeds.description as feed_description",
        "content.feeds.website_url as feed_website_url",
        "content.feeds.image_url as feed_image_url",
        "content.feeds.last_fetched_at as feed_last_fetched_at",
        "content.feeds.fetch_status as feed_status",
      ])
      .where("user.feed_subscriptions.user_id", "=", userId)
      .orderBy("user.feed_subscriptions.subscribed_at", "desc");

    if (isActive !== undefined) {
      query = query.where("user.feed_subscriptions.is_active", "=", isActive);
    }

    return await query.execute();
  }

  async findByUserAndFeed(userId: string, feedId: string) {
    return await this.db
      .selectFrom("user.feed_subscriptions")
      .selectAll()
      .where("user_id", "=", userId)
      .where("feed_id", "=", feedId)
      .executeTakeFirst();
  }

  async findByFeedId(feedId: string, isActive?: boolean) {
    let query = this.db
      .selectFrom("user.feed_subscriptions")
      .innerJoin("auth.user", "auth.user.id", "user.feed_subscriptions.user_id")
      .select([
        "user.feed_subscriptions.id",
        "user.feed_subscriptions.user_id",
        "user.feed_subscriptions.feed_id",
        "user.feed_subscriptions.is_active",
        "user.feed_subscriptions.notification_enabled",
        "user.feed_subscriptions.custom_name",
        "user.feed_subscriptions.subscribed_at",
        "auth.user.email as user_email",
        "auth.user.name as user_name",
      ])
      .where("user.feed_subscriptions.feed_id", "=", feedId)
      .orderBy("user.feed_subscriptions.subscribed_at", "desc");

    if (isActive !== undefined) {
      query = query.where("user.feed_subscriptions.is_active", "=", isActive);
    }

    return await query.execute();
  }

  async subscribe(userId: string, feedId: string, options?: {
    customName?: string;
    notificationEnabled?: boolean;
  }) {
    // Check if subscription already exists
    const existing = await this.findByUserAndFeed(userId, feedId);

    if (existing) {
      // Reactivate if it was inactive
      if (!existing.is_active) {
        return await this.update(existing.id, {
          is_active: true,
          custom_name: options?.customName || existing.custom_name,
          notification_enabled: options?.notificationEnabled ?? existing.notification_enabled,
        });
      }
      return existing;
    }

    // Create new subscription
    return await this.create({
      user_id: userId,
      feed_id: feedId,
      is_active: true,
      notification_enabled: options?.notificationEnabled ?? false,
      custom_name: options?.customName || null,
    });
  }

  async unsubscribe(userId: string, feedId: string) {
    return await this.db
      .updateTable("user.feed_subscriptions")
      .set({ is_active: false })
      .where("user_id", "=", userId)
      .where("feed_id", "=", feedId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: Partial<Omit<UserFeedSubscriptions, "id" | "created_at" | "user_id" | "feed_id">>) {
    return await this.db
      .updateTable("user.feed_subscriptions")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("user.feed_subscriptions")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getSubscriptionStats(userId: string) {
    return await this.db
      .selectFrom("user.feed_subscriptions")
      .select((eb) => [
        eb.fn.count("id").as("total_subscriptions"),
        eb.fn.count("id").filterWhere("is_active", "=", true).as("active_subscriptions"),
        eb.fn.count("id").filterWhere("notification_enabled", "=", true).as("notification_subscriptions"),
      ])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();
  }
}

export class ReadingHistoryRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<UserReadingHistory, "id" | "created_at" | "updated_at" | "read_at">) {
    return await this.db
      .insertInto("user.reading_history")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("user.reading_history")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
    since?: Date;
  }) {
    let query = this.db
      .selectFrom("user.reading_history")
      .innerJoin("content.articles", "content.articles.id", "user.reading_history.article_id")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select([
        "user.reading_history.id",
        "user.reading_history.article_id",
        "user.reading_history.read_at",
        "user.reading_history.read_duration",
        "user.reading_history.scroll_percentage",
        "content.articles.title as article_title",
        "content.articles.url as article_url",
        "content.articles.summary as article_summary",
        "content.articles.published_at as article_published_at",
        "content.feeds.title as feed_title",
        "content.feeds.url as feed_url",
      ])
      .where("user.reading_history.user_id", "=", userId)
      .orderBy("user.reading_history.read_at", "desc");

    if (options?.since) {
      query = query.where("user.reading_history.read_at", ">=", options.since);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findByUserAndArticle(userId: string, articleId: string) {
    return await this.db
      .selectFrom("user.reading_history")
      .selectAll()
      .where("user_id", "=", userId)
      .where("article_id", "=", articleId)
      .executeTakeFirst();
  }

  async recordReading(
    userId: string,
    articleId: string,
    options?: {
      readDuration?: number;
      scrollPercentage?: number;
    }
  ) {
    // Check if reading history already exists
    const existing = await this.findByUserAndArticle(userId, articleId);

    if (existing) {
      // Update existing record
      return await this.update(existing.id, {
        read_duration: options?.readDuration || existing.read_duration,
        scroll_percentage: options?.scrollPercentage || existing.scroll_percentage,
        read_at: new Date(),
      });
    }

    // Create new reading record
    return await this.create({
      user_id: userId,
      article_id: articleId,
      read_duration: options?.readDuration || null,
      scroll_percentage: options?.scrollPercentage || null,
    });
  }

  async update(id: string, data: Partial<Omit<UserReadingHistory, "id" | "created_at" | "user_id" | "article_id">>) {
    return await this.db
      .updateTable("user.reading_history")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("user.reading_history")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByUserId(userId: string) {
    return await this.db
      .deleteFrom("user.reading_history")
      .where("user_id", "=", userId)
      .execute();
  }

  async getReadingStats(userId: string, options?: {
    since?: Date;
    until?: Date;
  }) {
    let query = this.db
      .selectFrom("user.reading_history")
      .select((eb) => [
        eb.fn.count("id").as("articles_read"),
        eb.fn.avg("read_duration").as("avg_read_duration"),
        eb.fn.sum("read_duration").as("total_read_time"),
        eb.fn.avg("scroll_percentage").as("avg_scroll_percentage"),
        eb.fn.countDistinct("article_id").as("unique_articles_read"),
      ])
      .where("user_id", "=", userId);

    if (options?.since) {
      query = query.where("read_at", ">=", options.since);
    }

    if (options?.until) {
      query = query.where("read_at", "<=", options.until);
    }

    return await query.executeTakeFirstOrThrow();
  }

  async getTopFeeds(userId: string, options?: {
    limit?: number;
    since?: Date;
  }) {
    let query = this.db
      .selectFrom("user.reading_history")
      .innerJoin("content.articles", "content.articles.id", "user.reading_history.article_id")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select((eb) => [
        "content.feeds.id as feed_id",
        "content.feeds.title as feed_title",
        "content.feeds.url as feed_url",
        eb.fn.count("user.reading_history.id").as("articles_read"),
        eb.fn.avg("user.reading_history.read_duration").as("avg_read_duration"),
      ])
      .where("user.reading_history.user_id", "=", userId)
      .groupBy(["content.feeds.id", "content.feeds.title", "content.feeds.url"])
      .orderBy("articles_read", "desc");

    if (options?.since) {
      query = query.where("user.reading_history.read_at", ">=", options.since);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.execute();
  }
}

export class BookmarkRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<UserBookmarks, "id" | "created_at" | "updated_at" | "bookmarked_at">) {
    return await this.db
      .insertInto("user.bookmarks")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("user.bookmarks")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
    tags?: string[];
    searchTerm?: string;
  }) {
    let query = this.db
      .selectFrom("user.bookmarks")
      .innerJoin("content.articles", "content.articles.id", "user.bookmarks.article_id")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select([
        "user.bookmarks.id",
        "user.bookmarks.article_id",
        "user.bookmarks.custom_tags",
        "user.bookmarks.notes",
        "user.bookmarks.bookmarked_at",
        "content.articles.title as article_title",
        "content.articles.url as article_url",
        "content.articles.summary as article_summary",
        "content.articles.published_at as article_published_at",
        "content.articles.author as article_author",
        "content.feeds.title as feed_title",
        "content.feeds.url as feed_url",
      ])
      .where("user.bookmarks.user_id", "=", userId)
      .orderBy("user.bookmarks.bookmarked_at", "desc");

    if (options?.tags && options.tags.length > 0) {
      query = query.where((eb) =>
        eb("user.bookmarks.custom_tags", "&&", JSON.stringify(options.tags))
      );
    }

    if (options?.searchTerm) {
      query = query.where((eb) =>
        eb.or([
          eb("content.articles.title", "ilike", `%${options.searchTerm}%`),
          eb("content.articles.summary", "ilike", `%${options.searchTerm}%`),
          eb("user.bookmarks.notes", "ilike", `%${options.searchTerm}%`),
        ])
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findByUserAndArticle(userId: string, articleId: string) {
    return await this.db
      .selectFrom("user.bookmarks")
      .selectAll()
      .where("user_id", "=", userId)
      .where("article_id", "=", articleId)
      .executeTakeFirst();
  }

  async bookmark(
    userId: string,
    articleId: string,
    options?: {
      customTags?: string[];
      notes?: string;
    }
  ) {
    // Check if bookmark already exists
    const existing = await this.findByUserAndArticle(userId, articleId);

    if (existing) {
      // Update existing bookmark
      return await this.update(existing.id, {
        custom_tags: options?.customTags || existing.custom_tags,
        notes: options?.notes || existing.notes,
        bookmarked_at: new Date(),
      });
    }

    // Create new bookmark
    return await this.create({
      user_id: userId,
      article_id: articleId,
      custom_tags: options?.customTags || null,
      notes: options?.notes || null,
    });
  }

  async unbookmark(userId: string, articleId: string) {
    return await this.db
      .deleteFrom("user.bookmarks")
      .where("user_id", "=", userId)
      .where("article_id", "=", articleId)
      .returningAll()
      .executeTakeFirst();
  }

  async update(id: string, data: Partial<Omit<UserBookmarks, "id" | "created_at" | "user_id" | "article_id">>) {
    return await this.db
      .updateTable("user.bookmarks")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("user.bookmarks")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getAllTags(userId: string) {
    const result = await this.db
      .selectFrom("user.bookmarks")
      .select("custom_tags")
      .where("user_id", "=", userId)
      .where("custom_tags", "is not", null)
      .execute();

    // Flatten and deduplicate tags
    const allTags = result
      .flatMap(row => row.custom_tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .sort();

    return allTags;
  }

  async getBookmarkStats(userId: string) {
    return await this.db
      .selectFrom("user.bookmarks")
      .select((eb) => [
        eb.fn.count("id").as("total_bookmarks"),
        eb.fn.countDistinct("article_id").as("unique_articles"),
        eb.fn.count("id").filterWhere("notes", "is not", null).as("bookmarks_with_notes"),
        eb.fn.count("id").filterWhere("custom_tags", "is not", null).as("bookmarks_with_tags"),
      ])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();
  }
}

export class UserPreferenceRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<UserPreferences, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("user.preferences")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("user.preferences")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string, preferenceType?: "ai_summary" | "content_filter" | "notification" | "display") {
    let query = this.db
      .selectFrom("user.preferences")
      .selectAll()
      .where("user_id", "=", userId)
      .orderBy("preference_type", "asc")
      .orderBy("key", "asc");

    if (preferenceType) {
      query = query.where("preference_type", "=", preferenceType);
    }

    return await query.execute();
  }

  async findByUserTypeAndKey(
    userId: string,
    preferenceType: "ai_summary" | "content_filter" | "notification" | "display",
    key: string
  ) {
    return await this.db
      .selectFrom("user.preferences")
      .selectAll()
      .where("user_id", "=", userId)
      .where("preference_type", "=", preferenceType)
      .where("key", "=", key)
      .executeTakeFirst();
  }

  async upsertPreference(
    userId: string,
    preferenceType: "ai_summary" | "content_filter" | "notification" | "display",
    key: string,
    value: Record<string, any>
  ) {
    const existing = await this.findByUserTypeAndKey(userId, preferenceType, key);

    if (existing) {
      return await this.update(existing.id, { value });
    } else {
      return await this.create({
        user_id: userId,
        preference_type: preferenceType,
        key,
        value,
      });
    }
  }

  async getPreferenceValue<T = any>(
    userId: string,
    preferenceType: "ai_summary" | "content_filter" | "notification" | "display",
    key: string,
    defaultValue?: T
  ): Promise<T> {
    const preference = await this.findByUserTypeAndKey(userId, preferenceType, key);
    return preference?.value as T ?? defaultValue;
  }

  async update(id: string, data: Partial<Omit<UserPreferences, "id" | "created_at" | "user_id" | "preference_type" | "key">>) {
    return await this.db
      .updateTable("user.preferences")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("user.preferences")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByUserTypeAndKey(
    userId: string,
    preferenceType: "ai_summary" | "content_filter" | "notification" | "display",
    key: string
  ) {
    return await this.db
      .deleteFrom("user.preferences")
      .where("user_id", "=", userId)
      .where("preference_type", "=", preferenceType)
      .where("key", "=", key)
      .execute();
  }

  async deleteByUserId(userId: string) {
    return await this.db
      .deleteFrom("user.preferences")
      .where("user_id", "=", userId)
      .execute();
  }

  async getPreferencesAsMap(userId: string) {
    const preferences = await this.findByUserId(userId);

    const preferencesMap: Record<string, Record<string, any>> = {};

    for (const pref of preferences) {
      if (!preferencesMap[pref.preference_type]) {
        preferencesMap[pref.preference_type] = {};
      }
      preferencesMap[pref.preference_type][pref.key] = pref.value;
    }

    return preferencesMap;
  }
}
