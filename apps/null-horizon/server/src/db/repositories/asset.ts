import type { Kysely, Selectable, Insertable, Updateable } from "kysely";
import type { Database, AssetAssets } from "../types.js";

export class AssetRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Selectable<AssetAssets> | undefined> {
    return await this.db
      .selectFrom("asset.assets")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findBySymbol(
    symbol: string,
  ): Promise<Selectable<AssetAssets> | undefined> {
    return await this.db
      .selectFrom("asset.assets")
      .selectAll()
      .where("symbol", "=", symbol)
      .executeTakeFirst();
  }

  async findBySymbols(symbols: string[]): Promise<Selectable<AssetAssets>[]> {
    return await this.db
      .selectFrom("asset.assets")
      .selectAll()
      .where("symbol", "in", symbols)
      .execute();
  }

  async findByName(name: string): Promise<Selectable<AssetAssets>[]> {
    return await this.db
      .selectFrom("asset.assets")
      .selectAll()
      .where("name", "ilike", `%${name}%`)
      .execute();
  }

  async findAllOrderedBySymbol(): Promise<Selectable<AssetAssets>[]> {
    return await this.db
      .selectFrom("asset.assets")
      .selectAll()
      .orderBy("symbol", "asc")
      .execute();
  }

  async create(
    data: Insertable<AssetAssets>,
  ): Promise<Selectable<AssetAssets>> {
    return await this.db
      .insertInto("asset.assets")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<AssetAssets>,
  ): Promise<Selectable<AssetAssets> | undefined> {
    return await this.db
      .updateTable("asset.assets")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateBySymbol(
    symbol: string,
    data: Updateable<AssetAssets>,
  ): Promise<Selectable<AssetAssets> | undefined> {
    return await this.db
      .updateTable("asset.assets")
      .set(data)
      .where("symbol", "=", symbol)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("asset.assets")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async deleteBySymbol(symbol: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("asset.assets")
      .where("symbol", "=", symbol)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async symbolExists(symbol: string): Promise<boolean> {
    const result = await this.db
      .selectFrom("asset.assets")
      .select("id")
      .where("symbol", "=", symbol)
      .executeTakeFirst();

    return result !== undefined;
  }

  async count(): Promise<number> {
    const result = await this.db
      .selectFrom("asset.assets")
      .select(this.db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  }
}
