import type { Kysely } from "kysely";
import type { Database, ContentFeeds, ContentArticles } from "../types.js";

export class FeedRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<ContentFeeds, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("content.feeds")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("content.feeds")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUrl(url: string) {
    return await this.db
      .selectFrom("content.feeds")
      .selectAll()
      .where("url", "=", url)
      .executeTakeFirst();
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
    fetchStatus?: "active" | "error" | "paused";
  }) {
    let query = this.db
      .selectFrom("content.feeds")
      .selectAll()
      .orderBy("created_at", "desc");

    if (options?.isActive !== undefined) {
      query = query.where("is_active", "=", options.isActive);
    }

    if (options?.fetchStatus) {
      query = query.where("fetch_status", "=", options.fetchStatus);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findDueForRefresh() {
    return await this.db
      .selectFrom("content.feeds")
      .selectAll()
      .where("is_active", "=", true)
      .where("fetch_status", "=", "active")
      .where((eb) =>
        eb.or([
          eb("last_fetched_at", "is", null),
          eb(
            "last_fetched_at",
            "<",
            eb.fn("now").cast("timestamp with time zone").minus("refresh_interval * interval '1 minute'")
          ),
        ])
      )
      .orderBy("last_fetched_at", "asc")
      .execute();
  }

  async update(id: string, data: Partial<Omit<ContentFeeds, "id" | "created_at">>) {
    return await this.db
      .updateTable("content.feeds")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateFetchStatus(
    id: string,
    status: "active" | "error" | "paused",
    error?: string
  ) {
    return await this.db
      .updateTable("content.feeds")
      .set({
        fetch_status: status,
        fetch_error: error || null,
        last_fetched_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("content.feeds")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getStats() {
    return await this.db
      .selectFrom("content.feeds")
      .select((eb) => [
        eb.fn.count("id").as("total_feeds"),
        eb.fn.count("id").filterWhere("is_active", "=", true).as("active_feeds"),
        eb.fn.count("id").filterWhere("fetch_status", "=", "error").as("error_feeds"),
      ])
      .executeTakeFirstOrThrow();
  }
}

export class ArticleRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<ContentArticles, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("content.articles")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createMany(articles: Omit<ContentArticles, "id" | "created_at" | "updated_at">[]) {
    if (articles.length === 0) return [];

    return await this.db
      .insertInto("content.articles")
      .values(articles)
      .returningAll()
      .execute();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("content.articles")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUrl(url: string) {
    return await this.db
      .selectFrom("content.articles")
      .selectAll()
      .where("url", "=", url)
      .executeTakeFirst();
  }

  async findByFeedAndExternalId(feedId: string, externalId: string) {
    return await this.db
      .selectFrom("content.articles")
      .selectAll()
      .where("feed_id", "=", feedId)
      .where("external_id", "=", externalId)
      .executeTakeFirst();
  }

  async findByFeedId(
    feedId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "published_at" | "created_at";
      orderDirection?: "asc" | "desc";
    }
  ) {
    let query = this.db
      .selectFrom("content.articles")
      .selectAll()
      .where("feed_id", "=", feedId);

    const orderBy = options?.orderBy || "published_at";
    const orderDirection = options?.orderDirection || "desc";
    query = query.orderBy(orderBy, orderDirection);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findRecent(options?: {
    limit?: number;
    offset?: number;
    since?: Date;
  }) {
    let query = this.db
      .selectFrom("content.articles")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select([
        "content.articles.id",
        "content.articles.feed_id",
        "content.articles.external_id",
        "content.articles.title",
        "content.articles.content",
        "content.articles.summary",
        "content.articles.author",
        "content.articles.url",
        "content.articles.published_at",
        "content.articles.word_count",
        "content.articles.created_at",
        "content.articles.updated_at",
        "content.feeds.title as feed_title",
        "content.feeds.url as feed_url",
      ])
      .where("content.feeds.is_active", "=", true)
      .orderBy("content.articles.published_at", "desc");

    if (options?.since) {
      query = query.where("content.articles.published_at", ">=", options.since);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async search(
    searchTerm: string,
    options?: {
      limit?: number;
      offset?: number;
      feedIds?: string[];
    }
  ) {
    let query = this.db
      .selectFrom("content.articles")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select([
        "content.articles.id",
        "content.articles.feed_id",
        "content.articles.title",
        "content.articles.content",
        "content.articles.summary",
        "content.articles.author",
        "content.articles.url",
        "content.articles.published_at",
        "content.articles.word_count",
        "content.feeds.title as feed_title",
      ])
      .where("content.feeds.is_active", "=", true)
      .where((eb) =>
        eb.or([
          eb("content.articles.title", "ilike", `%${searchTerm}%`),
          eb("content.articles.content", "ilike", `%${searchTerm}%`),
          eb("content.articles.summary", "ilike", `%${searchTerm}%`),
        ])
      )
      .orderBy("content.articles.published_at", "desc");

    if (options?.feedIds && options.feedIds.length > 0) {
      query = query.where("content.articles.feed_id", "in", options.feedIds);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async update(id: string, data: Partial<Omit<ContentArticles, "id" | "created_at">>) {
    return await this.db
      .updateTable("content.articles")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("content.articles")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByFeedId(feedId: string) {
    return await this.db
      .deleteFrom("content.articles")
      .where("feed_id", "=", feedId)
      .execute();
  }

  async getStatsByFeed(feedId: string) {
    return await this.db
      .selectFrom("content.articles")
      .select((eb) => [
        eb.fn.count("id").as("total_articles"),
        eb.fn.avg("word_count").as("avg_word_count"),
        eb.fn.max("published_at").as("latest_published"),
        eb.fn.min("published_at").as("earliest_published"),
      ])
      .where("feed_id", "=", feedId)
      .executeTakeFirstOrThrow();
  }

  async findArticlesPendingAIProcessing(
    jobType: "summarize" | "classify" | "extract_entities" | "generate_recommendations",
    options?: {
      limit?: number;
      excludeArticleIds?: string[];
    }
  ) {
    let query = this.db
      .selectFrom("content.articles")
      .leftJoin("system.ai_jobs", (join) =>
        join
          .onRef("system.ai_jobs.article_id", "=", "content.articles.id")
          .on("system.ai_jobs.job_type", "=", jobType)
          .on("system.ai_jobs.status", "in", ["completed", "running"])
      )
      .selectAll("content.articles")
      .where("system.ai_jobs.id", "is", null) // No existing job
      .orderBy("content.articles.published_at", "desc");

    if (options?.excludeArticleIds && options.excludeArticleIds.length > 0) {
      query = query.where("content.articles.id", "not in", options.excludeArticleIds);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.execute();
  }

  async upsert(
    data: Omit<ContentArticles, "id" | "created_at" | "updated_at">,
    conflictColumns: ("url" | "feed_id" | "external_id")[] = ["url"]
  ) {
    // Kysely doesn't have built-in upsert, so we'll implement it manually
    const existing = await this.findByUrl(data.url || "");

    if (existing) {
      return await this.update(existing.id, data);
    } else {
      return await this.create(data);
    }
  }
}
