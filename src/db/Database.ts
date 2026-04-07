import { Generated } from "kysely";

export interface Database {
	metrics: MetricTable
	stats: StatsTable
	chatMessage: ChatMessageTable
}

export type MetricTable = {
	ID: Generated<number>
	timestamp: Generated<number>
	expected: number
	actual: number
}

export const createMetricTable = {
	name: "Create metric table",
	script: `
		CREATE TABLE metrics (
			ID INTEGER PRIMARY KEY,
			timestamp INTEGER DEFAULT (unixepoch('subsec') * 1000),
			expected REAL NOT NULL,
			actual REAL NOT NULL
		) STRICT;
	`
}

export type StatsTable = {
	key: string
	value: number
}

export const createStatsTable = {
	name: "Create stats table",
	script: `
		CREATE TABLE stats (
			key TEXT PRIMARY KEY NOT NULL,
			value INTEGER
		);

		INSERT INTO stats VALUES ("visits", 0);
		INSERT INTO stats VALUES ("clicks", 0);
	`
}

export type ChatMessageTable = {
	fromID: string;
	timestamp: number;
	content: string;
}

export const createChatMessageTable = {
	name: "Create chatMessage table",
	script: `
		CREATE TABLE chatMessage (
			fromID TEXT NOT NULL,
			timestamp INTEGER NOT NULL,
			content TEXT NOT NULL
		);
	`
}