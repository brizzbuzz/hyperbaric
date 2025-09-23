import type { Kysely } from "kysely";
import type {
  Database,
  AiArticleSummaries,
  AiArticleClassifications,
  AiRecommendations,
} from "../types.js";

export class ArticleSummaryRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<AiArticleSummaries, "id" | "created_at" | "updated_at" | "generated_at">) {
    return await this.db
      .insertInto("ai.article_summaries")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("ai.article_summaries")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByArticleId(articleId: string, summaryType?: "brief" | "detailed" | "bullet_points") {
    let query = this.db
      .selectFrom("ai.article_summaries")
      .selectAll()
      .where("article_id", "=", articleId)
      .orderBy("generated_at", "desc");

    if (summaryType) {
      query = query.where("summary_type", "=", summaryType);
    }

    return await query.execute();
  }

  async findLatestByArticleId(articleId: string, summaryType?: "brief" | "detailed" | "bullet_points") {
    let query = this.db
      .selectFrom("ai.article_summaries")
      .selectAll()
      .where("article_id", "=", articleId)
      .orderBy("generated_at", "desc");

    if (summaryType) {
      query = query.where("summary_type", "=", summaryType);
    }

    return await query.limit(1).executeTakeFirst();
  }

  async findByProvider(
    provider: string,
    options?: {
      model?: string;
      limit?: number;
      offset?: number;
      since?: Date;
    }
  ) {
    let query = this.db
      .selectFrom("ai.article_summaries")
      .selectAll()
      .where("ai_provider", "=", provider)
      .orderBy("generated_at", "desc");

    if (options?.model) {
      query = query.where("ai_model", "=", options.model);
    }

    if (options?.since) {
      query = query.where("generated_at", ">=", options.since);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async update(id: string, data: Partial<Omit<AiArticleSummaries, "id" | "created_at">>) {
    return await this.db
      .updateTable("ai.article_summaries")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("ai.article_summaries")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByArticleId(articleId: string) {
    return await this.db
      .deleteFrom("ai.article_summaries")
      .where("article_id", "=", articleId)
      .execute();
  }

  async getStats() {
    return await this.db
      .selectFrom("ai.article_summaries")
      .select((eb) => [
        eb.fn.count("id").as("total_summaries"),
        eb.fn.count("id").filterWhere("summary_type", "=", "brief").as("brief_summaries"),
        eb.fn.count("id").filterWhere("summary_type", "=", "detailed").as("detailed_summaries"),
        eb.fn.count("id").filterWhere("summary_type", "=", "bullet_points").as("bullet_point_summaries"),
        eb.fn.countDistinct("ai_provider").as("unique_providers"),
        eb.fn.countDistinct("article_id").as("articles_with_summaries"),
      ])
      .executeTakeFirstOrThrow();
  }
}

export class ArticleClassificationRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<AiArticleClassifications, "id" | "created_at" | "updated_at">) {
    return await this.db
      .insertInto("ai.article_classifications")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createMany(classifications: Omit<AiArticleClassifications, "id" | "created_at" | "updated_at">[]) {
    if (classifications.length === 0) return [];

    return await this.db
      .insertInto("ai.article_classifications")
      .values(classifications)
      .returningAll()
      .execute();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("ai.article_classifications")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByArticleId(
    articleId: string,
    classificationType?: "category" | "tag" | "sentiment" | "topic"
  ) {
    let query = this.db
      .selectFrom("ai.article_classifications")
      .selectAll()
      .where("article_id", "=", articleId)
      .orderBy("confidence_score", "desc");

    if (classificationType) {
      query = query.where("classification_type", "=", classificationType);
    }

    return await query.execute();
  }

  async findByValue(
    value: string,
    classificationType?: "category" | "tag" | "sentiment" | "topic",
    options?: {
      minConfidence?: number;
      limit?: number;
      offset?: number;
    }
  ) {
    let query = this.db
      .selectFrom("ai.article_classifications")
      .innerJoin("content.articles", "content.articles.id", "ai.article_classifications.article_id")
      .select([
        "ai.article_classifications.id",
        "ai.article_classifications.article_id",
        "ai.article_classifications.classification_type",
        "ai.article_classifications.value",
        "ai.article_classifications.confidence_score",
        "ai.article_classifications.ai_provider",
        "ai.article_classifications.ai_model",
        "ai.article_classifications.created_at",
        "content.articles.title as article_title",
        "content.articles.url as article_url",
      ])
      .where("ai.article_classifications.value", "ilike", `%${value}%`)
      .orderBy("ai.article_classifications.confidence_score", "desc");

    if (classificationType) {
      query = query.where("ai.article_classifications.classification_type", "=", classificationType);
    }

    if (options?.minConfidence !== undefined) {
      query = query.where("ai.article_classifications.confidence_score", ">=", options.minConfidence);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findTopValues(
    classificationType: "category" | "tag" | "sentiment" | "topic",
    options?: {
      limit?: number;
      minConfidence?: number;
      since?: Date;
    }
  ) {
    let query = this.db
      .selectFrom("ai.article_classifications")
      .select((eb) => [
        "value",
        eb.fn.count("id").as("count"),
        eb.fn.avg("confidence_score").as("avg_confidence"),
        eb.fn.max("confidence_score").as("max_confidence"),
      ])
      .where("classification_type", "=", classificationType)
      .groupBy("value")
      .orderBy("count", "desc");

    if (options?.minConfidence !== undefined) {
      query = query.where("confidence_score", ">=", options.minConfidence);
    }

    if (options?.since) {
      query = query.where("created_at", ">=", options.since);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.execute();
  }

  async update(id: string, data: Partial<Omit<AiArticleClassifications, "id" | "created_at">>) {
    return await this.db
      .updateTable("ai.article_classifications")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("ai.article_classifications")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteByArticleId(articleId: string) {
    return await this.db
      .deleteFrom("ai.article_classifications")
      .where("article_id", "=", articleId)
      .execute();
  }

  async getStats() {
    return await this.db
      .selectFrom("ai.article_classifications")
      .select((eb) => [
        eb.fn.count("id").as("total_classifications"),
        eb.fn.count("id").filterWhere("classification_type", "=", "category").as("categories"),
        eb.fn.count("id").filterWhere("classification_type", "=", "tag").as("tags"),
        eb.fn.count("id").filterWhere("classification_type", "=", "sentiment").as("sentiment_analyses"),
        eb.fn.count("id").filterWhere("classification_type", "=", "topic").as("topics"),
        eb.fn.avg("confidence_score").as("avg_confidence"),
        eb.fn.countDistinct("article_id").as("articles_with_classifications"),
      ])
      .executeTakeFirstOrThrow();
  }
}

export class RecommendationRepository {
  constructor(private db: Kysely<Database>) {}

  async create(data: Omit<AiRecommendations, "id" | "created_at" | "updated_at" | "generated_at">) {
    return await this.db
      .insertInto("ai.recommendations")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createMany(recommendations: Omit<AiRecommendations, "id" | "created_at" | "updated_at" | "generated_at">[]) {
    if (recommendations.length === 0) return [];

    return await this.db
      .insertInto("ai.recommendations")
      .values(recommendations)
      .returningAll()
      .execute();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom("ai.recommendations")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(
    userId: string,
    options?: {
      type?: "similar_content" | "trending" | "personalized";
      limit?: number;
      offset?: number;
      includeExpired?: boolean;
      minScore?: number;
    }
  ) {
    let query = this.db
      .selectFrom("ai.recommendations")
      .innerJoin("content.articles", "content.articles.id", "ai.recommendations.article_id")
      .innerJoin("content.feeds", "content.feeds.id", "content.articles.feed_id")
      .select([
        "ai.recommendations.id",
        "ai.recommendations.article_id",
        "ai.recommendations.recommendation_type",
        "ai.recommendations.score",
        "ai.recommendations.reasoning",
        "ai.recommendations.generated_at",
        "ai.recommendations.expires_at",
        "content.articles.title as article_title",
        "content.articles.summary as article_summary",
        "content.articles.url as article_url",
        "content.articles.published_at as article_published_at",
        "content.feeds.title as feed_title",
      ])
      .where("ai.recommendations.user_id", "=", userId)
      .orderBy("ai.recommendations.score", "desc");

    if (!options?.includeExpired) {
      query = query.where((eb) =>
        eb.or([
          eb("ai.recommendations.expires_at", "is", null),
          eb("ai.recommendations.expires_at", ">", new Date()),
        ])
      );
    }

    if (options?.type) {
      query = query.where("ai.recommendations.recommendation_type", "=", options.type);
    }

    if (options?.minScore !== undefined) {
      query = query.where("ai.recommendations.score", ">=", options.minScore);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }

  async findByArticleId(articleId: string) {
    return await this.db
      .selectFrom("ai.recommendations")
      .selectAll()
      .where("article_id", "=", articleId)
      .orderBy("score", "desc")
      .execute();
  }

  async update(id: string, data: Partial<Omit<AiRecommendations, "id" | "created_at">>) {
    return await this.db
      .updateTable("ai.recommendations")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom("ai.recommendations")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteExpired() {
    return await this.db
      .deleteFrom("ai.recommendations")
      .where("expires_at", "<", new Date())
      .execute();
  }

  async deleteByUserId(userId: string) {
    return await this.db
      .deleteFrom("ai.recommendations")
      .where("user_id", "=", userId)
      .execute();
  }

  async deleteByArticleId(articleId: string) {
    return await this.db
      .deleteFrom("ai.recommendations")
      .where("article_id", "=", articleId)
      .execute();
  }

  async refreshRecommendations(
    userId: string,
    type: "similar_content" | "trending" | "personalized",
    newRecommendations: Omit<AiRecommendations, "id" | "created_at" | "updated_at" | "generated_at">[]
  ) {
    return await this.db.transaction().execute(async (trx) => {
      // Delete existing recommendations of this type for the user
      await trx
        .deleteFrom("ai.recommendations")
        .where("user_id", "=", userId)
        .where("recommendation_type", "=", type)
        .execute();

      // Insert new recommendations
      if (newRecommendations.length > 0) {
        return await trx
          .insertInto("ai.recommendations")
          .values(newRecommendations)
          .returningAll()
          .execute();
      }

      return [];
    });
  }

  async getStats() {
    return await this.db
      .selectFrom("ai.recommendations")
      .select((eb) => [
        eb.fn.count("id").as("total_recommendations"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "similar_content").as("similar_content"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "trending").as("trending"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "personalized").as("personalized"),
        eb.fn.countDistinct("user_id").as("users_with_recommendations"),
        eb.fn.countDistinct("article_id").as("recommended_articles"),
        eb.fn.avg("score").as("avg_score"),
        eb.fn.count("id").filterWhere("expires_at", ">", eb.fn("now")).as("active_recommendations"),
      ])
      .executeTakeFirstOrThrow();
  }

  async getUserRecommendationStats(userId: string) {
    return await this.db
      .selectFrom("ai.recommendations")
      .select((eb) => [
        eb.fn.count("id").as("total_recommendations"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "similar_content").as("similar_content"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "trending").as("trending"),
        eb.fn.count("id").filterWhere("recommendation_type", "=", "personalized").as("personalized"),
        eb.fn.avg("score").as("avg_score"),
        eb.fn.max("generated_at").as("last_generated"),
      ])
      .where("user_id", "=", userId)
      .executeTakeFirstOrThrow();
  }
}
