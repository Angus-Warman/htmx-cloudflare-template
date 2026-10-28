import { migrations } from "./Database";

const setupMigrationTable = `
CREATE TABLE IF NOT EXISTS __migrations
(
	name TEXT NOT NULL,
	timestamp INTEGER DEFAULT (unixepoch('subsec') * 1000)
)`

type MigrationRecord = {
	name: string;
	timestamp: number;
}

export default function runMigrations(sql: SqlStorage) {
	console.log("Running migrations...");

	sql.exec(setupMigrationTable);

	const recordedMigrations = sql.exec("SELECT * FROM __migrations").toArray() as MigrationRecord[];

	const recordedMigrationNames = new Set(recordedMigrations.map(r => r.name));

	for (const migration of migrations) {
		if (recordedMigrationNames.has(migration.name)) continue;

		console.log(migration.name);

		sql.exec(migration.script);

		sql.exec("INSERT INTO __migrations (name) VALUES (?)", migration.name);
	}
}
