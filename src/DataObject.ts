import { DurableObject } from "cloudflare:workers";
import runMigrations from "./db/runMigrations";
import { Database } from "./db/Database";
import { Kysely } from "kysely";
import { DurableDialect } from "./utils/DurableDialect";
import { Metric } from "./types";

export default class DataObject extends DurableObject {
	ready: Promise<void>;
	private db: Kysely<Database>

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)

		this.ready = this.migrate()

		this.db = new Kysely<Database>({
			dialect: new DurableDialect({ ctx })
		})
	}

	async migrate() {
		await runMigrations(this.ctx.storage.sql)
	}

	// Two stats are created during the DB migration, "clicks" and "visits"
	async getStat(key: string) {
		await this.ready;

		const result = await this.db
			.selectFrom("stats")
			.selectAll()
			.where("key", "=", key)
			.executeTakeFirstOrThrow();

		return result.value;
	}

	async incrementStat(key: string) {
		await this.ready;

		const result = await this.db
			.updateTable("stats")
			.set((eb) => ({ value: eb("value", "+", 1) }))
			.where("key", "=", key)
			.returning("value")
			.executeTakeFirstOrThrow();

		return result.value;
	}

	async getMetrics(): Promise<Metric[]> {
		await this.ready;

		const rows = await this.db
			.selectFrom("metrics")
			.orderBy("timestamp")
			.selectAll()
			.execute();

		return rows;
	}

	/** This isn't `tryGetMetric`, it gets the row or it throws */
	async getMetric(rowID: number): Promise<Metric> {
		return await this.db
			.selectFrom("metrics")
			.selectAll()
			.where("ID", "=", rowID)
			.executeTakeFirstOrThrow()
	}

	async addMetric(expected: number, actual: number) {
		await this.ready;

		await this.db
			.insertInto("metrics")
			.values({ expected, actual })
			.execute();
	}

	async updateMetric(rowID: number, expected: number, actual: number) {
		await this.ready;

		const result = await this.db
			.updateTable("metrics")
			.where("ID", "=", rowID)
			.set("expected", expected)
			.set("actual", actual)
			.executeTakeFirst();

		if (result.numUpdatedRows === 0n) {
			return new Response("Metric row not found", { status: 404 })
		}
	}

	async deleteMetricRow(rowID: string) {
		await this.ready;

		await this.db
			.deleteFrom("metrics")
			.where("ID", "=", Number(rowID))
			.execute();
	}

	/** Warning: This does exactly what it says it does */
	async executeRawSqlQuery(rawSql: string) {
		await this.ready

		try {
			const result = this.ctx.storage.sql.exec(rawSql)

			return JSON.stringify(result.toArray(), null, 2)
		}
		catch (error: unknown) {
			return error?.toString() ?? "(no response)";
		}
	}
}