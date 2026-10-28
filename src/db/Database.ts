import { Kysely, Generated, Insertable, Selectable } from "kysely";
import { DurableDialect } from "./DurableDialect";

export interface Schema {
    comments: CommentsTable;
}

export type CommentsTable = {
    id: Generated<number>;
    createdAt: Generated<number>;
    author: string;
    text: string;
};

export type Comment = Selectable<CommentsTable>;
export type NewComment = Insertable<CommentsTable>;

const createCommentsTable = {
    name: "Create comments table",
    script: `
		CREATE TABLE comments (
			id INTEGER PRIMARY KEY,
			createdAt INTEGER DEFAULT (unixepoch('subsec') * 1000),
			author TEXT NOT NULL,
			text TEXT NOT NULL
		) STRICT;
	`,
};

export const migrations = [createCommentsTable];

export type Database = Kysely<Schema>;

export function connectDB(ctx: DurableObjectState): Database {
    return new Kysely<Schema>({
        dialect: new DurableDialect({ ctx }),
    });
}
