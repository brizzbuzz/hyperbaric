import type { Kysely, Selectable, Insertable, Updateable } from "kysely";
import type {
  Database,
  AuthUser,
  AuthSession,
  AuthAccount,
  AuthVerification,
} from "../types.js";

export class UserRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Selectable<AuthUser> | undefined> {
    return await this.db
      .selectFrom("auth.user")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByEmail(email: string): Promise<Selectable<AuthUser> | undefined> {
    return await this.db
      .selectFrom("auth.user")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  async findByEmailVerified(
    emailVerified: boolean,
  ): Promise<Selectable<AuthUser>[]> {
    return await this.db
      .selectFrom("auth.user")
      .selectAll()
      .where("emailVerified", "=", emailVerified)
      .execute();
  }

  async create(data: Insertable<AuthUser>): Promise<Selectable<AuthUser>> {
    return await this.db
      .insertInto("auth.user")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<AuthUser>,
  ): Promise<Selectable<AuthUser> | undefined> {
    return await this.db
      .updateTable("auth.user")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("auth.user")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export class SessionRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Selectable<AuthSession> | undefined> {
    return await this.db
      .selectFrom("auth.session")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByToken(
    token: string,
  ): Promise<Selectable<AuthSession> | undefined> {
    return await this.db
      .selectFrom("auth.session")
      .selectAll()
      .where("token", "=", token)
      .executeTakeFirst();
  }

  async findByUserId(userId: string): Promise<Selectable<AuthSession>[]> {
    return await this.db
      .selectFrom("auth.session")
      .selectAll()
      .where("userId", "=", userId)
      .execute();
  }

  async findActiveByUserId(userId: string): Promise<Selectable<AuthSession>[]> {
    return await this.db
      .selectFrom("auth.session")
      .selectAll()
      .where("userId", "=", userId)
      .where("expiresAt", ">", new Date())
      .execute();
  }

  async create(
    data: Insertable<AuthSession>,
  ): Promise<Selectable<AuthSession>> {
    return await this.db
      .insertInto("auth.session")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<AuthSession>,
  ): Promise<Selectable<AuthSession> | undefined> {
    return await this.db
      .updateTable("auth.session")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("auth.session")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db
      .deleteFrom("auth.session")
      .where("expiresAt", "<", new Date())
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }
}

export class AccountRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<Selectable<AuthAccount> | undefined> {
    return await this.db
      .selectFrom("auth.account")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string): Promise<Selectable<AuthAccount>[]> {
    return await this.db
      .selectFrom("auth.account")
      .selectAll()
      .where("userId", "=", userId)
      .execute();
  }

  async findByProvider(
    providerId: string,
    accountId: string,
  ): Promise<Selectable<AuthAccount> | undefined> {
    return await this.db
      .selectFrom("auth.account")
      .selectAll()
      .where("providerId", "=", providerId)
      .where("accountId", "=", accountId)
      .executeTakeFirst();
  }

  async findByUserAndProvider(
    userId: string,
    providerId: string,
  ): Promise<Selectable<AuthAccount> | undefined> {
    return await this.db
      .selectFrom("auth.account")
      .selectAll()
      .where("userId", "=", userId)
      .where("providerId", "=", providerId)
      .executeTakeFirst();
  }

  async create(
    data: Insertable<AuthAccount>,
  ): Promise<Selectable<AuthAccount>> {
    return await this.db
      .insertInto("auth.account")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<AuthAccount>,
  ): Promise<Selectable<AuthAccount> | undefined> {
    return await this.db
      .updateTable("auth.account")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("auth.account")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }
}

export class VerificationRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(
    id: string,
  ): Promise<Selectable<AuthVerification> | undefined> {
    return await this.db
      .selectFrom("auth.verification")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async findByIdentifierAndValue(
    identifier: string,
    value: string,
  ): Promise<Selectable<AuthVerification> | undefined> {
    return await this.db
      .selectFrom("auth.verification")
      .selectAll()
      .where("identifier", "=", identifier)
      .where("value", "=", value)
      .executeTakeFirst();
  }

  async findByIdentifier(
    identifier: string,
  ): Promise<Selectable<AuthVerification>[]> {
    return await this.db
      .selectFrom("auth.verification")
      .selectAll()
      .where("identifier", "=", identifier)
      .execute();
  }

  async create(
    data: Insertable<AuthVerification>,
  ): Promise<Selectable<AuthVerification>> {
    return await this.db
      .insertInto("auth.verification")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<AuthVerification>,
  ): Promise<Selectable<AuthVerification> | undefined> {
    return await this.db
      .updateTable("auth.verification")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom("auth.verification")
      .where("id", "=", id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db
      .deleteFrom("auth.verification")
      .where("expiresAt", "<", new Date())
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }

  async deleteByIdentifier(identifier: string): Promise<number> {
    const result = await this.db
      .deleteFrom("auth.verification")
      .where("identifier", "=", identifier)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }
}
