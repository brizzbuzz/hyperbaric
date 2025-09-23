import type { Kysely } from "kysely";
import type {
  Database,
  SystemFeedJobs,
  SystemAiJobs,
  SystemSettings,
  SystemMetrics,
} from "../types.js";

export class FeedJobRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<SystemFeedJobs, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("system.feed_jobs")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("system.feed_jobs")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByFeedId(feedId: string, options?: {
    status?: "pending" | "running" | "completed" | "failed";
    limit?: number;
    offset?: number;
  }) {
    let query = this.db
      .selectFrom("system.feed_jobs")
      .selectAll()
      .where("feed_id", "=", feedId)
      .orderBy("created_at", "desc");

    if (options?.status) {
      query = query.where("status", "=", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findPending(options?: {
    jobType?: "fetch_feed" | "process_articles" | "generate_summaries";
    limit?: number;
    maxRetries?: number;
  }) {
    let query = this.db
      .selectFrom("system.feed_jobs")
      .selectAll()
      .where("status", "in", ["pending", "failed"])
      .where((eb) => eb("retry_count", "<", eb.ref("max_retries")))
      .orderBy("priority", "asc")
      .orderBy("created_at", "asc");

    if (options?.jobType) {
      query = query.where("job_type", "=", options.jobType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.execute();
  }

  async markAsRunning(id: string) {
    return await this.db
      .updateTable("system.feed_jobs")
      .set({
        status: "running",
        started_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async markAsCompleted(id: string, metadata?: Record<string, any>) {
    return await this.db
      .updateTable("system.feed_jobs")
      .set({
        status: "completed",
        completed_at: new Date(),
        metadata,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async markAsFailed(id: string, errorMessage: string, shouldRetry: boolean = true) {
    const job = await this.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }

    const newRetryCount = job.retry_count + 1;
    const canRetry = shouldRetry && newRetryCount < job.max_retries;

    return await this.db
      .updateTable("system.feed_jobs")
      .set({
        status: canRetry ? "pending" : "failed",
        error_message: errorMessage,
        retry_count: newRetryCount,
        completed_at: canRetry ? null : new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: Partial<Omit<SystemFeedJobs, "id" | "created_at">>) {
    return await this.db
      .updateTable("system.feed_jobs")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("system.feed_jobs")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteCompleted(olderThanDays: number = 30) {
    return await this.db
      .deleteFrom("system.feed_jobs")
      .where("status", "=", "completed")
      .where("completed_at", "<", new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000))
      .execute();
  }

  async getJobStats() {
    return await this.db
      .selectFrom("system.feed_jobs")
      .select((eb) => [
        eb.fn.count("id").as("total_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "pending").as("pending_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "running").as("running_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "completed").as("completed_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "failed").as("failed_jobs"),
        eb.fn.avg(eb.case()
          .when("completed_at", "is not", null)
          .and("started_at", "is not", null)
          .then(eb("completed_at", "-", eb.ref("started_at")))
          .end()).as("avg_processing_time"),
      ])
      .where("created_at", ">", new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .executeTakeFirstOrThrow();
  }
}

export class AIJobRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<SystemAiJobs, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("system.ai_jobs")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("system.ai_jobs")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByArticleId(articleId: string, options?: {
    jobType?: "summarize" | "classify" | "extract_entities" | "generate_recommendations";
    status?: "pending" | "running" | "completed" | "failed";
    limit?: number;
    offset?: number;
  }) {
    let query = this.db
      .selectFrom("system.ai_jobs")
      .selectAll()
      .where("article_id", "=", articleId)
      .orderBy("created_at", "desc");

    if (options?.jobType) {
      query = query.where("job_type", "=", options.jobType);
    }

    if (options?.status) {
      query = query.where("status", "=", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findPending(options?: {
    jobType?: "summarize" | "classify" | "extract_entities" | "generate_recommendations";
    aiProvider?: string;
    limit?: number;
    maxRetries?: number;
  }) {
    let query = this.db
      .selectFrom("system.ai_jobs")
      .selectAll()
      .where("status", "in", ["pending", "failed"])
      .where((eb) => eb("retry_count", "<", eb.ref("max_retries")))
      .orderBy("priority", "asc")
      .orderBy("created_at", "asc");

    if (options?.jobType) {
      query = query.where("job_type", "=", options.jobType);
    }

    if (options?.aiProvider) {
      query = query.where("ai_provider", "=", options.aiProvider);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.execute();
  }

  async markAsRunning(id: string) {
    return await this.db
      .updateTable("system.ai_jobs")
      .set({
        status: "running",
        started_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async markAsCompleted(id: string, outputData?: Record<string, any>, actualCost?: number) {
    return await this.db
      .updateTable("system.ai_jobs")
      .set({
        status: "completed",
        completed_at: new Date(),
        output_data: outputData,
        actual_cost: actualCost,
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async markAsFailed(id: string, errorMessage: string, shouldRetry: boolean = true) {
    const job = await this.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }

    const newRetryCount = job.retry_count + 1;
    const canRetry = shouldRetry && newRetryCount < job.max_retries;

    return await this.db
      .updateTable("system.ai_jobs")
      .set({
        status: canRetry ? "pending" : "failed",
        error_message: errorMessage,
        retry_count: newRetryCount,
        completed_at: canRetry ? null : new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(id: string, data: Partial<Omit<SystemAiJobs, "id" | "created_at">>) {
    return await this.db
      .updateTable("system.ai_jobs")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("system.ai_jobs")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteCompleted(olderThanDays: number = 30) {
    return await this.db
      .deleteFrom("system.ai_jobs")
      .where("status", "=", "completed")
      .where("completed_at", "<", new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000))
      .execute();
  }

  async getJobStats() {
    return await this.db
      .selectFrom("system.ai_jobs")
      .select((eb) => [
        eb.fn.count("id").as("total_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "pending").as("pending_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "running").as("running_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "completed").as("completed_jobs"),
        eb.fn.count("id").filterWhere("status", "=", "failed").as("failed_jobs"),
        eb.fn.sum("actual_cost").as("total_cost"),
        eb.fn.avg("actual_cost").as("avg_cost_per_job"),
        eb.fn.avg(eb.case()
          .when("completed_at", "is not", null)
          .and("started_at", "is not", null)
          .then(eb("completed_at", "-", eb.ref("started_at")))
          .end()).as("avg_processing_time"),
      ])
      .where("created_at", ">", new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .executeTakeFirstOrThrow();
  }

  async getCostByProvider(since?: Date) {
    let query = this.db
      .selectFrom("system.ai_jobs")
      .select((eb) => [
        "ai_provider",
        "ai_model",
        eb.fn.count("id").as("job_count"),
        eb.fn.sum("actual_cost").as("total_cost"),
        eb.fn.avg("actual_cost").as("avg_cost"),
      ])
      .where("status", "=", "completed")
      .where("actual_cost", "is not", null)
      .groupBy(["ai_provider", "ai_model"])
      .orderBy("total_cost", "desc");

    if (since) {
      query = query.where("completed_at", ">=", since);
    }

    return await query.execute();
  }
}

export class SystemSettingsRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<SystemSettings, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("system.settings")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("system.settings")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByKey(key: string) {
    return await this.db
      .selectFrom("system.settings")
      .selectAll()
      .where("key", "=", key)
      .executeTakeFirst();
  }

  async findAll() {
    return await this.db
      .selectFrom("system.settings")
      .selectAll()
      .orderBy("key", "asc")
      .execute();
  }

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    const setting = await this.findByKey(key);
    return setting?.value as T ?? defaultValue;
  }

  async setValue(key: string, value: Record<string, any>, description?: string) {
    const existing = await this.findByKey(key);

    if (existing) {
      return await this.update(existing.id, { value, description });
    } else {
      return await this.create({
        key,
        value,
        description: description || null,
        is_encrypted: false,
      });
    }
  }

  async update(id: string, data: Partial<Omit<SystemSettings, "id" | "created_at" | "key">>) {
    return await this.db
      .updateTable("system.settings")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("system.settings")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByKey(key: string) {
    return await this.db
      .deleteFrom("system.settings")
      .where("key", "=", key)
      .execute();
  }

  async getSettingsAsMap() {
    const settings = await this.findAll();
    const settingsMap: Record<string, any> = {};

    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return settingsMap;
  }
}

export class SystemMetricsRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<SystemMetrics, "id" | "created_at" | "recorded_at">) {
    return await this.db
      .insertInto("system.metrics")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async recordMetric(
    metricName: string,
    metricType: "counter" | "gauge" | "histogram",
    value: number,
    tags?: Record<string, any>
  ) {
    return await this.create({
      metric_name: metricName,
      metric_type: metricType,
      value,
      tags: tags || null,
    });
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("system.metrics")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByMetricName(
    metricName: string,
    options?: {
      since?: Date;
      until?: Date;
      tags?: Record<string, any>;
      limit?: number;
      offset?: number;
    }
  ) {
    let query = this.db
      .selectFrom("system.metrics")
      .selectAll()
      .where("metric_name", "=", metricName)
      .orderBy("recorded_at", "desc");

    if (options?.since) {
      query = query.where("recorded_at", ">=", options.since);
    }

    if (options?.until) {
      query = query.where("recorded_at", "<=", options.until);
    }

    if (options?.tags) {
      query = query.where("tags", "@>", JSON.stringify(options.tags));
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async getMetricStats(
    metricName: string,
    options?: {
      since?: Date;
      until?: Date;
      tags?: Record<string, any>;
    }
  ) {
    let query = this.db
      .selectFrom("system.metrics")
      .select((eb) => [
        eb.fn.count("id").as("count"),
        eb.fn.min("value").as("min_value"),
        eb.fn.max("value").as("max_value"),
        eb.fn.avg("value").as("avg_value"),
        eb.fn.sum("value").as("sum_value"),
        eb.fn.min("recorded_at").as("first_recorded"),
        eb.fn.max("recorded_at").as("last_recorded"),
      ])
      .where("metric_name", "=", metricName);

    if (options?.since) {
      query = query.where("recorded_at", ">=", options.since);
    }

    if (options?.until) {
      query = query.where("recorded_at", "<=", options.until);
    }

    if (options?.tags) {
      query = query.where("tags", "@>", JSON.stringify(options.tags));
    }

    return await query.executeTakeFirstOrThrow();
  }

  async getMetricTimeSeries(
    metricName: string,
    intervalMinutes: number = 60,
    options?: {
      since?: Date;
      until?: Date;
      tags?: Record<string, any>;
    }
  ) {
    const since = options?.since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours
    const until = options?.until || new Date();

    let query = this.db
      .selectFrom("system.metrics")
      .select((eb) => [
        eb.fn("date_trunc", ["'minute'", eb.ref("recorded_at")]).as("time_bucket"),
        eb.fn.avg("value").as("avg_value"),
        eb.fn.min("value").as("min_value"),
        eb.fn.max("value").as("max_value"),
        eb.fn.count("id").as("count"),
      ])
      .where("metric_name", "=", metricName)
      .where("recorded_at", ">=", since)
      .where("recorded_at", "<=", until)
      .groupBy("time_bucket")
      .orderBy("time_bucket", "asc");

    if (options?.tags) {
      query = query.where("tags", "@>", JSON.stringify(options.tags));
    }

    return await query.execute();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("system.metrics")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteOldMetrics(olderThanDays: number = 90) {
    return await this.db
      .deleteFrom("system.metrics")
      .where("recorded_at", "<", new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000))
      .execute();
  }

  async getAllMetricNames() {
    const result = await this.db
      .selectFrom("system.metrics")
      .selectDistinct("metric_name")
      .orderBy("metric_name", "asc")
      .execute();

    return result.map(row => row.metric_name);
  }
}
