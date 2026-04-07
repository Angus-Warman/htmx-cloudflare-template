// A simple wrapper to link up Kysely and DurableObject SQLite.

import {
	CompiledQuery,
	Kysely,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler,
	type DatabaseConnection,
	type DatabaseIntrospector,
	type Dialect,
	type Driver,
	type QueryCompiler,
	type QueryResult,
} from "kysely";

export interface DurableDialectConfig {
	ctx: DurableObjectState
}

export class DurableDialect implements Dialect {
	config: DurableDialectConfig

	constructor(config: DurableDialectConfig) {
		this.config = config
	}

	createAdapter() {
		return new SqliteAdapter()
	}

	createDriver(): Driver {
		return new DurableDriver(this.config)
	}

	createQueryCompiler(): QueryCompiler {
		return new SqliteQueryCompiler()
	}

	createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return new SqliteIntrospector(db)
	}
}

class DurableDriver implements Driver {
	config: DurableDialectConfig

	constructor(config: DurableDialectConfig) {
		this.config = config
	}

	async init(): Promise<void> { }

	async acquireConnection(): Promise<DatabaseConnection> {
		return new DurableConnection(this.config)
	}

	async beginTransaction(conn: DurableConnection): Promise<void> {
		return await conn.beginTransaction()
	}

	async commitTransaction(conn: DurableConnection): Promise<void> {
		return await conn.commitTransaction()
	}

	async rollbackTransaction(conn: DurableConnection): Promise<void> {
		return await conn.rollbackTransaction()
	}

	async releaseConnection(_conn: DurableConnection): Promise<void> { }

	async destroy(): Promise<void> { }
}

class DurableConnection implements DatabaseConnection {
	config: DurableDialectConfig

	constructor(config: DurableDialectConfig) {
		this.config = config
	}

	async executeQuery<T>(compiledQuery: CompiledQuery): Promise<QueryResult<T>> {
		const cursor = this.config.ctx.storage.sql.exec(compiledQuery.sql, ...compiledQuery.parameters)

		const rows = cursor.toArray() as T[]

		const numAffectedRows = cursor.rowsWritten > 0 ? BigInt(cursor.rowsWritten) : undefined

		return {
			insertId: undefined, // Durable Objects don't provide last_row_id
			rows: rows || [],
			numAffectedRows,
		}
	}

	async beginTransaction() {
		throw new Error("Transactions not supported")
	}

	async commitTransaction() {
		throw new Error("Transactions not supported")
	}

	async rollbackTransaction() {
		throw new Error("Transactions not supported")
	}

	async *streamQuery<T>(_compiledQuery: CompiledQuery, _chunkSize: number): AsyncIterableIterator<QueryResult<T>> {
		throw new Error("Streaming not supported")
	}
}